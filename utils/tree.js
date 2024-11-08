/**
 * Tree Node with N children
 */
class Node {
  constructor(id, data) {
    this.id = id;
    this.data = data;
    this.children = [];
  }
}

/**
 * N-ary tree used for housing the hierarchy of materials
 */
class Tree {
  /**
   * @param {number} id
   * @param {{power_level: number, qty: number, c_qty: number}} data
   */
  constructor(id, data) {
    const node = new Node(id, data);
    this.root = node;
  }

  /**
   * Uses a queue to find the node with the corresponding id
   * @param {number} id
   * @param {Node} node
   * @returns the node
   */
  findNode(id, node) {
    const queue = [];
    queue.push(node);

    while (queue.length !== 0) {
      const thisNode = queue.shift();

      if (thisNode.id === id) {
        return thisNode;
      }

      for (const childNode of thisNode.children) {
        queue.push(childNode);
      }
    }

    return null;
  }

  /**
   * Populates the tree with materials
   * @param {{power_level: number, qty: number, c_qty: number}[]} materials
   */
  populate(materials) {
    for (const material of materials) {
      const parentNode = this.findNode(material.parent_id, this.root);
      const newNode = new Node(material.material_id, {
        power_level: material.power_level,
        qty: material.qty,
        c_qty: material.c_qty
      });
      parentNode.children.push(newNode);
    }
  }

  /**
   * Calculates the total power level of a material composition (aka the tree)
   * @param {number} total
   * @param {Node} node
   * @returns the total power level of the given base material
   */
  calculateTotalPower(total, node) {
    if (!node) {
      return 0;
    }

    if (node.children.length === 0) {
      return node.data.c_qty * node.data.power_level;
    }

    let sum = 0;
    for (const childNode of node.children) {
      sum += this.calculateTotalPower(total, childNode);
    }

    return node.data.c_qty * (node.data.power_level + sum);
  }

  /**
   * Calculates the number of times a weapon can be built.
   * @param {number} total
   * @param {Node} node
   * @returns The number of times a weapon can be built
   */
  getMaxQuantity(total, node) {
    if (!node) {
      return 0;
    }

    if (node.children.length === 0) {
      return node.data.qty / node.data.c_qty;
    }

    let sum = 0;
    for (const childNode of node.children) {
      sum += this.getMaxQuantity(total, childNode);
    }

    return (node.data.qty + sum) / (node.data.c_qty ?? 1);
  }

  /**
   * Prints the values of the tree
   * @param {Node} node
   * @returns void
   */
  traverse(node) {
    if (!node) {
      return;
    }

    for (const childNode of node.children) {
      this.traverse(childNode);
    }

    console.log(`{ id: ${node.id}, pl: ${node.data.power_level}, qty: ${node.data.qty}}`);
  }
}

module.exports = Tree;
