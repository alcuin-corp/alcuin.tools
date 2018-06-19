import { IAnyObjectDto } from "./dtos";
export declare class Graph {
    private index;
    private parents;
    private children;
    constructor(index: Map<string, IAnyObjectDto>);
    get(id: string): IAnyObjectDto | undefined;
    childrenOf(id: string): string[];
    parentsOf(id: string): string[];
    visitAll<T>(id: string, followings: (id: string) => string[], visitor: (obj: IAnyObjectDto, lvl: number) => T): T[];
    visitAllChildren<T>(id: string, visitor: (obj: IAnyObjectDto, lvl: number) => T): T[];
    getAllChildren(id: string): IAnyObjectDto[];
    visitAllParents<T>(id: string, visitor: (obj: IAnyObjectDto, lvl: number) => T): T[];
    getAllParents(id: string): IAnyObjectDto[];
}
