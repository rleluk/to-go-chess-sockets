class TreeNode {
    move: string;
    positionFEN: string;
    private parent: TreeNode;
    private mainChild: TreeNode;
    private children: TreeNode[];

    constructor(move: string, positionFEN: string) {
        this.move = move;
        this.positionFEN = positionFEN;
        this.parent = undefined;
        this.mainChild = undefined;
        this.children = [];
    }

    addParent = (parent: TreeNode) => {
        this.parent = parent;
    }

    getParent = () => this.parent;

    addChild = (child: TreeNode) => {
        if (this.children.length === 0) {
            this.mainChild = child;
        }
        this.children.push(child);
    }

    getChildren = () => this.children;

    setMainChild = (child: TreeNode) => {
        if (this.children.includes(child)) {
            this.mainChild = child;
        } else {
            throw new Error("Setting main child unsuccessful: this node does not have such child.");
        }
    }

    getMainChild = () => this.mainChild;

    toString = () => {
        return this.move;
    }
}

export default TreeNode;