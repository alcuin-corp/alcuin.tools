"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isRef(self) {
    if (self && typeof (self) === "object") {
        if ("TargetId" in self && "IsRef" in self && "RefType" in self) {
            return true;
        }
    }
    return false;
}
function* findReferences(self) {
    if (self) {
        if (typeof (self) === "object") {
            if (isRef(self)) {
                yield self.TargetId;
            }
            else {
                for (const entry of Object.entries(self)) {
                    yield* findReferences(entry[1]);
                }
            }
        }
        else if (Array.isArray(self)) {
            for (const child of self) {
                yield* findReferences(child);
            }
        }
    }
}
function findParents(index) {
    return Array.from(index, ([id, o]) => {
        const refs = Array.from(findReferences(o));
        return { id, refs };
    }).reduce((acc, { id, refs }) => acc.set(id, refs), new Map());
}
class Graph {
    constructor(index) {
        this.index = index;
        this.parents = findParents(index);
        this.children = new Map();
        for (const [childId, currentParents] of this.parents.entries()) {
            for (const currentParent of currentParents) {
                this.children.set(currentParent, [...this.children.get(currentParent) || [], childId]);
            }
        }
    }
    get(id) {
        return this.index.get(id);
    }
    childrenOf(id) {
        return this.children.get(id) || [];
    }
    parentsOf(id) {
        return this.parents.get(id) || [];
    }
    visitAll(id, followings, visitor) {
        const result = [];
        const stack = [];
        stack.push({ currentId: id, currentLevel: 0 });
        while (true) {
            const pop = stack.pop();
            if (!pop) {
                break;
            }
            const { currentId, currentLevel } = pop;
            const content = this.get(currentId);
            if (content) {
                if (content.Id !== id) {
                    result.push(visitor(content, currentLevel));
                }
                for (const childId of followings(content.Id)) {
                    stack.push({ currentId: childId, currentLevel: currentLevel + 1 });
                }
            }
        }
        return result;
    }
    visitAllChildren(id, visitor) {
        return this.visitAll(id, this.childrenOf.bind(this), visitor);
    }
    getAllChildren(id) {
        return this.visitAllChildren(id, (obj, _) => obj);
    }
    visitAllParents(id, visitor) {
        return this.visitAll(id, this.parentsOf.bind(this), visitor);
    }
    getAllParents(id) {
        return this.visitAllParents(id, (obj, _) => obj);
    }
}
exports.Graph = Graph;
//# sourceMappingURL=graph.js.map