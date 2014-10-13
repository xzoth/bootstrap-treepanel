
$.fn.treePanel = function (options) {
    var TreePanel = function (element, options) {
        var me = this;
        me.$element = $(element);
        me.selectedNode = null;

        if (options.data && (typeof options.data === 'string')) {
            options.data = $.parseJSON(options.data);
        }

        me._options = $.extend({}, TreePanel.prototype._defaultOptions, options);
        delete options;

        me._render();
    };

    TreePanel.prototype = {
        update: function (node) {
            var me = this;
            var nodeId = me._genNodeID(node);
            var nodeData = me._findNodeData(nodeId);
            $.extend(nodeData, node);
            var text = me._getNodeText(nodeData);

            var nodeItem = me._findNodeItem(nodeId);
            var oldText = nodeItem.text();
            var newHtml = nodeItem.html().replace(oldText, text);
            nodeItem.html(newHtml);
        },

        add: function (node, parent, index) {
            var me = this;

            if (typeof node === 'string') {
                node = $.parseJSON(node);
            }

            var parentNode = null;
            //append to data
            if (parent) {
                parentNode = me._getNodeData(parent);
                if (parentNode) {
                    if (me._hasChild(parentNode)) {
                        var childNode = me._childNodes(parentNode);
                        if (index != null) {
                            childNode.splice(index, 0, node);
                        } else {
                            childNode.push(node);
                        }
                    } else {
                        parentNode.attr(me._options.childNodesField, [node]);
                    }
                }
            } else {
                if (index != null) {
                    me._options.data.splice(index, 0, node);
                } else {
                    me._options.data.push(node);
                }
            }

            //params
            var nodeId = me._genNodeID(node);
            var nodeData = me._findNodeData(nodeId);
            var depth = me._getDepth(nodeData);
            var nodeItem = $(TreePanel.prototype._template.nodeItem);

            //append nodeItem
            if (parentNode) {
                var parentNodeId = me._genNodeID(parentNode)
                var parentNodeItem = me._findNodeItem(parentNodeId);
                if (me._hasChild(parentNode)) {
                    var childNode = me._childNodes(parentNode);
                    if (index != null) {
                        if (index > 0) {
                            var beforeNode = childNode[index - 1];
                            var beforeNodeId = me._genNodeID(beforeNode);
                            var beforeNodeItem = me._findNodeItem(beforeNodeId);
                            beforeNodeItem.after(nodeItem);
                        } else {
                            var afterNode = childNode[1];
                            var afterNodeId = me._genNodeID(afterNode);
                            var afterNodeItem = me._findNodeItem(afterNodeId);
                            afterNodeItem.before(nodeItem);
                        }
                    } else {
                        var childContainer = parentNodeItem.next();
                        childContainer.append(nodeItem);
                    }
                } else {
                    var childContainer = $(TreePanel.prototype._template.nodeContainer);
                    parentNodeItem.append(childContainer);
                    childContainer.append(nodeItem);

                    //change parent icon
                    var parentIcon = parentNodeItem.find('i');
                    parentIcon.addClass(me._options.collapseIcon);
                }

            } else {
                me.$element.append(nodeItem);
            }

            me._buildNode(nodeItem, nodeData, depth);
            me._subscribeEvents();
        },

        move: function (node, parentNode, index) {

        },

        remove: function (node) {
            var me = this;

            var nodeId = me._genNodeID(node);
            var nodeData = me._findNodeData(nodeId);
            var nodeItem = me._findNodeItem(nodeId);
            //if current selected node is removing node or child node, then disselect it
            if (me.selectedNode != null) {
                if (me.selectedNode == nodeData || me._isChildNode(nodeData, me.selectedNode)) {
                    me.disSelect(nodeData);
                }
            }

            //remove nodeItem
            var hasChild = me._hasChild(nodeData);
            if (hasChild) {
                var nodeContainer = nodeItem.next();
                nodeContainer.hide('fast', function () {
                    nodeContainer.remove();
                });
            }
            nodeItem.hide('fast', function () {
                nodeItem.remove();
            });

            //remove nodeData
            var parentNode = me._parentNode(nodeData);
            me._removeNode(nodeData);

            //updata parent nodeItem
            if (parentNode) {
                var hasChild = me._hasChild(parentNode);
                if (!hasChild) {
                    var parentNodeItem = me._findNodeItem(me._genNodeID(parentNode));
                    if (parentNodeItem) {
                        //remove parent icon                    
                        var parentItemIcon = parentNodeItem.find('i.node-icon');
                        if (parentItemIcon.attr('class').indexOf(me._options.collapseIcon) > -1) {
                            parentItemIcon.removeClass(me._options.collapseIcon);
                        }
                        if (parentItemIcon.attr('class').indexOf(me._options.expandIcon) > -1) {
                            parentItemIcon.removeClass(me._options.expandIcon);
                        }
                        //remove container
                        parentNodeItem.next().hide('fast', function () {
                            $(this).remove();
                        });
                    }
                }
            }
        },

        expand: function (node) {
            var me = this;

            var nodeId = me._genNodeID(node);
            var nodeData = me._findNodeData(nodeId);
            var hasChild = me._hasChild(nodeData);
            if (hasChild) {
                var nodeItem = me._findNodeItem(nodeId);
                var nodeIcon = nodeItem.find('i.node-icon');
                if (nodeIcon && nodeIcon.attr('class').indexOf(me._options.collapseIcon) >= 0) {
                    var nodeContainer = nodeItem.next();
                    nodeContainer.show('fast');
                    nodeIcon.removeClass(me._options.collapseIcon);
                    nodeIcon.addClass(me._options.expandIcon);
                }
            }
        },

        collapse: function (node) {
            var me = this;

            var nodeId = me._genNodeID(node);
            var nodeData = me._findNodeData(nodeId);
            var hasChild = me._hasChild(nodeData);
            if (hasChild) {
                var nodeId = me._genNodeID(nodeData);
                var nodeItem = me._findNodeItem(nodeId);
                var nodeIcon = nodeItem.find('i.node-icon');
                if (nodeIcon && nodeIcon.attr('class').indexOf(me._options.collapseIcon) < 0) {
                    var nodeContainer = nodeItem.next();
                    nodeContainer.hide('fast');
                    nodeIcon.removeClass(me._options.expandIcon);
                    nodeIcon.addClass(me._options.collapseIcon);
                }
            }
        },

        select: function (node) {
            var me = this;

            var nodeId = me._genNodeID(node);
            var nodeData = me._findNodeData(nodeId);
            if (me.selectedNode != nodeData) {
                me._cleanSelection();
                var nodeItem = me._findNodeItem(nodeId);
                nodeItem.addClass('active');
                me.selectedNode = nodeData;
                me._triggerNodeSelectedEvent(nodeData);
            }
        },

        disSelect: function (node) {
            var me = this;
            me._cleanSelection();
            me.selectedNode = null;
        },

        _render: function () {
            var me = this;

            var data = me._options.data;
            for (index in data) {
                var nodeItem = $(TreePanel.prototype._template.nodeItem);
                me.$element.append(nodeItem);
                me._buildNode(nodeItem, data[index], 1);
            }

            me._subscribeEvents();
        },

        _buildNode: function (nodeItem, nodeData, depth) {
            var me = this;
            nodeData = $(nodeData);
            var nodeID = me._genNodeID(nodeData);
            nodeItem.attr('data-nodeId', nodeID);

            //build indent
            for (var i = 1; i < depth; i++) {
                var nodeIndent = $(TreePanel.prototype._template.nodeIndent);
                nodeItem.append(nodeIndent);
            }

            //build icon
            var nodeIcon = $(TreePanel.prototype._template.nodeIcon);
            nodeItem.append(nodeIcon);
            if (me._options.childNodesField != '') {
                var childNodes = nodeData.attr(me._options.childNodesField);
                if (childNodes && childNodes.length > 0) {
                    if (depth <= me._options.expandDepth) {
                        nodeIcon.addClass(me._options.expandIcon);
                    } else {
                        nodeIcon.addClass(me._options.collapseIcon);
                    }
                }
            }

            //build node
            if (me._options.displayField != '') {
                var text = me._getNodeText(nodeData);
                nodeItem.append(text);

                if (!me._options.hasBorder) {
                    nodeItem.addClass('node-noborder');
                }
            }

            //build child nodes
            if (me._options.childNodesField != '') {
                var childNodes = nodeData.attr(me._options.childNodesField);
                if (childNodes && childNodes.length > 0) {
                    var childDepth = depth + 1;
                    var childContainer = $(TreePanel.prototype._template.nodeContainer);

                    for (index in childNodes) {
                        var childNodeItem = $(TreePanel.prototype._template.nodeItem);
                        childContainer.append(childNodeItem);
                        me._buildNode(childNodeItem, childNodes[index], childDepth);
                    }

                    nodeItem.after(childContainer);

                    if (depth <= me._options.expandDepth) {
                        childContainer.show();
                    } else {
                        childContainer.hide();
                    }
                }
            }

            return nodeItem;
        },

        _findNodeItem: function (nodeId) {
            var me = this;

            var selector = me._getNodeSelector();
            for (index in selector) {
                var $item = $(selector[index]);
                var itemNodeId = $item.attr('data-nodeId');
                if (itemNodeId == nodeId) {
                    return $item;
                }
            }
        },

        _findNodeData: function (nodeId) {
            var me = this;

            var unique = me._getUniqueByNodeID(nodeId);
            var fieldName = me._options.valueField;
            if (fieldName == '') {
                fieldName = me._options.displayField;
            }
            var matchFilter = function ($node) {
                if ($node.attr(fieldName) == unique) {
                    return true;
                }
                return false;
            };

            var resultArray = me._scanTreeData(matchFilter);
            return resultArray[0];
        },

        _scanTreeData: function (filterFun) {
            var me = this;

            if (filterFun && typeof filterFun === 'function') {
                var scanFunction = function (nodeArray) {
                    var result = [];
                    nodeArray.forEach(function (node) {
                        var $node = $(node);
                        if (filterFun($node)) {
                            result.push(node);
                        }
                        if (me._options.childNodesField != '') {
                            var childNodes = $node.attr(me._options.childNodesField);
                            if (childNodes) {
                                var childMatch = scanFunction(childNodes);
                                result = result.concat(childMatch);
                            }
                        }
                    });

                    return result;
                };

                return scanFunction(me._options.data);
            }

            return [];
        },

        _hasChild: function (nodeData) {
            var me = this;

            $nodeData = $(nodeData);
            if (me._options.childNodesField != '') {
                var childNodes = $nodeData.attr(me._options.childNodesField);
                if (childNodes && childNodes.length > 0) {
                    return true;
                }
            }

            return false;
        },

        _subscribeEvents: function () {
            var me = this;
            me._unSubscribeEvents();

            if (me._options.onNodeSelected && (typeof me._options.onNodeSelected === 'function')) {
                me.$element.on('nodeSelected', me._options.onNodeSelected);
            }

            var nodeSelector = me._getNodeSelector();
            $(nodeSelector).on('click', $.proxy(me._elementClickHandler, me));
        },

        _unSubscribeEvents: function () {
            var me = this;

            var nodeSelector = me._getNodeSelector();
            $(nodeSelector).off('click');

            if (me._options.onNodeSelected && (typeof me._options.onNodeSelected === 'function')) {
                me.$element.off('nodeSelected', me._options.onNodeSelected);
            }
        },

        _elementClickHandler: function (event) {
            var me = this;
            var eventTarget = $(event.target);
            var currTarget = $(event.currentTarget);

            var nodeId = currTarget.attr('data-nodeId');
            var nodeData = me._findNodeData(nodeId);

            if (eventTarget[0].tagName == 'A') {
                if (me.selectedNode == nodeData) {
                    me.disSelect.call(me, nodeData);
                } else {
                    me.select.call(me, nodeData);
                }
            } else if (eventTarget[0].tagName == 'I') {
                var nodeIcon = currTarget.find('i.node-icon');
                if (nodeIcon.attr('class').indexOf(me._options.collapseIcon) >= 0) {
                    me.expand(nodeData);
                } else {
                    me.collapse(nodeData);
                }
            }
        },

        _triggerNodeSelectedEvent: function (nodeData) {
            var me = this;
            me.$element.trigger('nodeSelected', [$.extend(true, {}, nodeData)]);
        },

        _genNodeID: function (nodeData) {
            var me = this;
            var nodeID = 'node_';
            if (typeof nodeData === 'string') {
                nodeID = nodeID + nodeData;
            } else {
                var unique = me._getUniqueByNodeData(nodeData);
                nodeID = nodeID + unique;
            }

            return nodeID;
        },

        _getUniqueByNodeData: function (nodeData) {
            var me = this;
            $nodeData = $(nodeData);

            var unique = '';
            if (me._options.valueField != '') {
                unique = $nodeData.attr(me._options.valueField);
            } else if (me._options.displayField != '') {
                unique = $nodeData.attr(me._options.displayField);
            } else {
                unique = ++me._nodeCounter;
            }

            return unique;
        },

        _getNodeText: function (nodeData) {
            var me = this;

            var text = $(nodeData).attr(me._options.displayField);
            return text;
        },

        _getNodeData: function (node) {
            var me = this;

            if (typeof node === 'string') {
                var matchFun = function ($item) {
                    if ($item.attr(me._options.valueField) == node) {
                        return true;
                    }
                };
                return me._scanTreeData(matchFun);
            } else {
                return $(node);
            }
        },

        _cleanSelection: function () {
            var me = this;
            me._getNodeSelector().each(function () {
                $(this).removeClass('active');
            });
        },

        _getUniqueByNodeID: function (nodeId) {
            return nodeId.substring(5);
        },

        _getNodeSelector: function () {
            var me = this;
            var selector = '#' + me.$element.attr('id') + ' .list-group-item';
            return $(selector);
        },

        _nodeCounter: 0,
        _template: {
            nodeItem: '<a class="list-group-item" href="#"></a>',
            nodeContainer: '<span class="node-container"></span>',
            nodeIndent: '<span class="node-indent"></span>',
            nodeIcon: '<i class="node-icon glyphicon"></i>',
        },
        _defaultOptions: {
            displayField: '',
            valueField: '',
            childNodesField: '',
            expandDepth: 2,
            expandIcon: 'glyphicon-chevron-down',
            collapseIcon: 'glyphicon-chevron-right',
            //backColor: '',
            //borderColor: '',
            //hoverColor: '',
            hasBorder: true,
            //isHighlightSelected: true,
            //isEnableLinks: false
            onNodeSelected: function (event, node) { }
        },


        /*
        those function should be extend as class: TreeNode
        */
        _getDepth: function (node) {
            var me = this;

            var depth = 1;
            var nodeData = me._getNodeData(node);
            var parentNode = me._parentNode(nodeData);
            while (parentNode) {
                depth++;
                parentNode = me._parentNode(parentNode);
            }

            return depth;
        },
        _parentNode: function (nodeData) {
            var me = this;

            var unique = me._getUniqueByNodeData(nodeData);
            var filter = function ($node) {
                var childNodes = me._childNodes($node);
                if (childNodes) {
                    for (index in childNodes) {
                        var itemUnique = me._getUniqueByNodeData(childNodes[index]);
                        if (unique == itemUnique) {
                            return true;
                        }
                    }
                }
            };

            var parentNode = me._scanTreeData(filter);
            if (parentNode && parentNode.length > 0) {
                return parentNode[0];
            } else {
                return null;
            }
        },
        _childNodes: function (nodeData) {
            var me = this;

            var childNodes = [];
            if (me._options.childNodesField != '') {
                childNodes = $(nodeData).attr(me._options.childNodesField);
            }
            return childNodes;
        },
        _prevNode: function (nodeData) {
            var me = this;

        },
        _nextNode: function (nodeData) {
            var me = this;

        },
        _removeNode: function (nodeData) {
            var me = this;
            var parentNode = me._parentNode(nodeData);
            var childNodes = [];
            if (parentNode) {
                childNodes = me._childNodes(parentNode);
            } else {
                childNodes = me._options.data;
            }

            var index = childNodes.indexOf(nodeData);
            childNodes.splice(index, 1);
        },
        _isChildNode: function (parentNode, childNode) {
            var me = this;

            var parentUnique = me._getUniqueByNodeData(parentNode);
            var p = me._parentNode(childNode);
            while (p) {
                var unique = me._getUniqueByNodeData(p);
                if (parentUnique == unique) {
                    return true;
                }

                p = me._parentNode(p);
            }

            return false;
        }
    };

    var treePanel = new TreePanel(this, options);
    return treePanel;
};