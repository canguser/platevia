export interface IsPlate {
    describe: Function;
    /**
     * Get the template result string
     * @param context The params for template
     * @return Result of template
     */
    via<T>(context: object): T;
}
/**
 * 解析表达式，该表达式可以直接获取到 context 对象内的属性
 * @param expression {string} 表达式字符串
 * @param contextName {string=} 指定 context 的 name
 * @return Plate Entity
 */
export declare function parsePlate(expression: string, contextName?: string): IsPlate;
