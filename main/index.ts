// 获取相应方法
import * as types from "ast-types";
import {visit} from "ast-types";
import {parse} from "recast/lib/parser";
import {Printer} from "recast/lib/printer";

function prettyPrint(node, options = {}) {
    return new Printer(options).printGenerically(node);
}

function print(node, options = {}) {
    return new Printer(options).print(node);
}

const {identifier, memberExpression} = types.builders;
const TNT = types.namedTypes;

export interface IsPlate {
    describe: Function

    /**
     * Get the template result string
     * @param context The params for template
     * @return Result of template
     */
    via<T>(context: object): T
}

/**
 * 解析表达式，该表达式可以直接获取到 context 对象内的属性
 * @param expression {string} 表达式字符串
 * @param contextName {string=} 指定 context 的 name
 * @return Plate Entity
 */
export function parsePlate(expression: string, contextName = 'context'): IsPlate {

    // 因为使用的是 new Function 所以加上 return 一起解析，也可以在最后 return
    const returnPattern = 'return ' + expression;

    // 解析获取到 AST 对象
    const ASTResult = parse(returnPattern);

    const body = ASTResult.program.body[0]; // 默认表达式只有单个语句，只解析第一句的内容

    visit(body, {
        // 遍历所有 Identifier 节点
        visitIdentifier(path) {
            const currentNode = path.node;
            const {parentNode, key, index} = getParentByChildNode(path);

            if (canIdentityReplaced(path.parentPath, key, index)) {
                // 替换节点
                // 第一个参数为 object 节点，第二个参数为 property 节点
                const replaceKey = index == null ? key : index;
                parentNode[replaceKey] = memberExpression(
                    identifier(contextName), // 默认将 object 节点命名为 context
                    currentNode
                );
            }

            // 继续遍历
            this.traverse(path);
        }
    });

    replaceAllFunctionExpress(body);

    const resultExpress = prettyPrint(ASTResult).code;

    return {
        describe: new Function(contextName, resultExpress),
        via<T>(context: object): T {
            return this.describe.call(context, context);
        }
    };
}

function replaceAllFunctionExpress(rootBody) {
    visit(rootBody, {
        // 遍历所有 ArrowFunctionExpression 节点
        visitArrowFunctionExpression(path) {
            replaceFunctionExpress(path);
            this.traverse(path);
        },
        visitFunctionExpression(path) {
            replaceFunctionExpress(path);
            this.traverse(path);
        }
    });
}

function replaceFunctionExpress(functionPath) {
    const body = functionPath.node.body;
    let hasOuterReturn = true;
    if (TNT.BlockStatement.check(body)) {
        hasOuterReturn = false;
    }
    replaceAllFunctionExpress(body);
    const resultExpress = ['\'' + (hasOuterReturn ? 'return ' : ''), '\''].join(print(body).code.replace(/'/g, '\\\'').replace(/\n/g, '\\n'));
    const params = functionPath.node.params.map(p => p.name);
    const statement = `
                {return (new Function('context', ${resultExpress}))(Object.assign({},context,{${params.join(',')}}))}
            `;
    functionPath.node.body = parse(statement).program.body[0];
}

function getParentByChildNode(currentPath) {

    const currentNode = currentPath.node;
    let parentNode = currentPath.parentPath.node;

    // 获取到当前节点是属于父节点的哪个属性
    let key = Object.keys(parentNode).find(key => parentNode[key] === currentNode);
    let index = undefined;

    if (key === undefined) {
        // 如果未获取到 key 值，则可能是该节点所属的属性是父级节点的一个 list 节点
        // 这种情况需要把父节点转换为 list 节点
        const nodeKey = Object.keys(parentNode).find(
            (nodeKey) => {
                const node = parentNode[nodeKey];
                if ((node instanceof Array) && node.includes(currentNode)) {
                    // 将 key 覆盖为数组下标
                    index = node.indexOf(currentNode);
                    return true;
                }
                return false;
            }
        );
        key = nodeKey;
        parentNode = parentNode[nodeKey];
    }

    return {
        parentNode, key, index
    }
}

function canIdentityReplaced(parentPath, key, index) {
    const parentNode = parentPath.node;
    // check member
    const isMemberNode = TNT.MemberExpression.check(parentNode) && key === 'property';
    if (isMemberNode) {
        return false;
    }
    const isFunctionParams = (
        TNT.ArrowFunctionExpression.check(parentNode) ||
        TNT.FunctionExpression.check(parentNode)
    ) && key === 'params';
    if (isFunctionParams) {
        return false;
    }
    const isPropertyKey = TNT.Property.check(parentNode) && !parentNode.computed && !parentNode.method;
    if (isPropertyKey) {
        return false;
    }
    const isVarDeclarator = TNT.VariableDeclarator.check(parentNode) && key === 'id';
    if (isVarDeclarator) {
        return false;
    }
    return true;
}