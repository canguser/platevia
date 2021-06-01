[platevia](README.md) / Exports

# platevia

## Table of contents

### Interfaces

- [IsPlate](interfaces/isplate.md)

### Functions

- [parsePlate](modules.md#parseplate)

## Functions

### parsePlate

▸ **parsePlate**(`expression`: *string*, `contextName?`: *string*): [*IsPlate*](interfaces/isplate.md)

解析表达式，该表达式可以直接获取到 context 对象内的属性

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `expression` | *string* | - | 表达式字符串 |
| `contextName` | *string* | 'context' | 指定 context 的 name |

**Returns:** [*IsPlate*](interfaces/isplate.md)

Plate Entity

Defined in: [index.ts:35](https://github.com/canguser/platevia/blob/f79835c/main/index.ts#L35)
