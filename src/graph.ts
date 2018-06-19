import { IRefDto, IAnyObjectDto } from "./dto";

function isRef(self: any): self is IRefDto {
    if (self && typeof(self) === "object") {
        if ("TargetId" in self && "IsRef" in self && "RefType" in self) {
            return true;
        }
    }
    return false;
}

function* findReferences(self: any): IterableIterator<string> {
    if (self) {
        if (typeof(self) === "object") {
            if (isRef(self)) {
                yield self.TargetId;
            } else {
                for (const entry of Object.entries(self)) {
                    yield *findReferences(entry[1]);
                }
            }
        } else if (Array.isArray(self)) {
            for (const child of self) {
                yield *findReferences(child);
            }
        }
    }
}

function findParents(index: Map<string, IAnyObjectDto>): Map<string, string[]> {
    return Array.from(index, ([id, o]) => {
        const refs = Array.from(findReferences(o));
        return {id, refs};
    }).reduce((acc, {id, refs}) => acc.set(id, refs), new Map<string, string[]>());
}

export class Graph {
    private parents: Map<string, string[]>;
    private children: Map<string, string[]>;

    constructor(private index: Map<string, IAnyObjectDto>) {
        this.parents = findParents(index);
        this.children = new Map<string, string[]>();
        for (const [childId, currentParents] of this.parents.entries()) {
            for (const currentParent of currentParents) {
                this.children.set(currentParent, [...this.children.get(currentParent) || [], childId]);
            }
        }
    }

    public get(id: string): IAnyObjectDto | undefined {
        return this.index.get(id);
    }

    public childrenOf(id: string): string[] {
        return this.children.get(id) || [];
    }

    public parentsOf(id: string): string[] {
        return this.parents.get(id) || [];
    }

    public visitAll<T>(id: string,
                       followings: (id: string) => string[],
                       visitor: (obj: IAnyObjectDto, lvl: number) => T): T[] {
        const result: T[] = [];
        const stack: Array<{currentId: string, currentLevel: number}> = [];
        stack.push({currentId: id, currentLevel: 0});
        while (true) {
            const pop = stack.pop();
            if (!pop) { break; }

            const {currentId, currentLevel} = pop;
            const content = this.get(currentId);
            if (content) {
                if (content.Id !== id) {
                    result.push(visitor(content, currentLevel));
                }
                for (const childId of followings(content.Id)) {
                    stack.push({currentId: childId, currentLevel: currentLevel + 1});
                }
            }
        }
        return result;
    }

    public visitAllChildren<T>(id: string, visitor: (obj: IAnyObjectDto, lvl: number) => T): T[] {
        return this.visitAll(id, this.childrenOf.bind(this), visitor);
    }

    public getAllChildren(id: string): IAnyObjectDto[] {
        return this.visitAllChildren(id, (obj, _) => obj);
    }

    public visitAllParents<T>(id: string, visitor: (obj: IAnyObjectDto, lvl: number) => T): T[] {
        return this.visitAll(id, this.parentsOf.bind(this), visitor);
    }

    public getAllParents(id: string): IAnyObjectDto[] {
        return this.visitAllParents(id, (obj, _) => obj);
    }
}
