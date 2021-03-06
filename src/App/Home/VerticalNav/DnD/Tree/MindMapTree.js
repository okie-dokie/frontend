import React from "react";
import { Classes, Tree } from "@blueprintjs/core";

// use Component so it re-renders everytime: `nodes` are not a primitive type
// and therefore aren't included in shallow prop comparison
export default class MindMapTree extends React.Component {
  state = {
    contents: this.props.contents,
  };

  render() {
    return (
      <Tree
        contents={this.state.contents}
        onNodeClick={this.handleNodeClick}
        onNodeCollapse={this.handleNodeCollapse}
        onNodeExpand={this.handleNodeExpand}
        className={Classes.ELEVATION_0}
      />
    );
  }

  handleNodeClick = (nodeData, _nodePath, e) => {
    const originallySelected = nodeData.isSelected;
    if (!e.shiftKey) {
      this.forEachNode(this.state.nodes, (n) => (n.isSelected = false));
    }
    nodeData.isSelected =
      originallySelected == null ? true : !originallySelected;
    this.setState(this.state);
  };

  handleNodeCollapse = (nodeData) => {
    nodeData.isExpanded = false;
    this.setState(this.state);
  };

  handleNodeExpand = (nodeData) => {
    nodeData.isExpanded = true;
    this.setState(this.state);
  };

  forEachNode(nodes, callback) {
    if (nodes == null) {
      return;
    }

    for (const node of nodes) {
      callback(node);
      this.forEachNode(node.childNodes, callback);
    }
  }
  componentDidUpdate(prevProps) {
    if (prevProps.update !== this.props.update) {
      this.setState({
        contents: this.props.contents,
      });
    }
  }
}
