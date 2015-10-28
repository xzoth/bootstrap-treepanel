
$.fn.treePanel = function(options) {
    var TreePanel = function(element, options) {
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
        update: function(node) {
            var me = this;
            var nodeId = me._genNodeID(node);
            var nodeData = me._findNodeData(nodeId);
            $.extend(nodeData, node);
            var text = me._getNodeText(nodeData);

            var nodeItem = me._findNodeItem(nodeId);
            var oldText = nodeItem.text();
            var newHtml = nodeItem.html().replace(oldText, text);
            nodeItem.html(newHtml);

            //rerender node icon
            me._reRenderNodeIcon(nodeItem, nodeData);
        },

        add: function(node, parent, index) {
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
                        $(parentNode).attr(me._options.childNodesField, [node]);
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
            nodeItem.hide();

            //append nodeItem
            if (parentNode) {
                var parentNodeId = me._genNodeID(parentNode)
                var parentNodeItem = me._findNodeItem(parentNodeId);
                var childNode = me._childNodes(parentNode);
                if (me._hasChild(parentNode) && childNode.length > 1) {
                    if (index != null) {
                        if (index > 0) {
                            var beforeNode = childNode[index - 1];
                            var beforeNodeId = me._genNodeID(beforeNode);
                            var beforeNodeItem = me._findNodeItem(beforeNodeId);
                            if (me._hasChild(beforeNode)) {
                                beforeNodeItem.next().after(nodeItem);
                            } else {
                                beforeNodeItem.after(nodeItem);
                            }
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
                    parentNodeItem.after(childContainer);
                    childContainer.append(nodeItem);
                    childContainer.hide();
                }

                //update parent toggle icon
                var parentToggleIcon = parentNodeItem.find('i.toggle-icon');
                var toggleRender = me._options.toggleIcon.render;
                if (toggleRender != null && typeof toggleRender === 'function') {
                    var toggleClass = toggleRender.call(me, parentNode, me._options.toggleIcon);
                    parentToggleIcon.addClass(toggleClass);
                } else {
                    if (!parentToggleIcon.hasClass(me._options.toggleIcon.expandIcon) &&
                        !parentToggleIcon.hasClass(me._options.toggleIcon.collapseIcon)) {
                        parentToggleIcon.addClass(me._options.toggleIcon.collapseIcon)
                    }
                }
                //rerender parent node icon
                me._reRenderNodeIcon(parentNodeItem, parentNode);

            } else {
                if (index != null) {
                    if (index > 0) {
                        $(me._getNodeSelector()[index]).before(nodeItem);
                    } else {
                        me.$element.prepend(nodeItem);
                    }
                } else {
                    me.$element.append(nodeItem);
                }
            }

            me._buildNode(nodeItem, nodeData, depth);
            me._subscribeEvents();

            nodeItem.show('fast').attr('style', '');
        },

        move: function(node, parent, index) {
            var me = this;

            var nodeData = me._getNodeData(node);
            var cloneObj = JSON.parse(JSON.stringify(nodeData))
            me.remove(nodeData);
            me.add(cloneObj, parent, index);
        },

        clean: function(node) {
            var me = this;

            var nodeId = me._genNodeID(node);
            var nodeData = me._findNodeData(nodeId);
            var childNode = me._childNodes(nodeData);
            if (childNode != null && childNode.length > 0) {
                var len = childNode.length;
                for (var i = 0; i < len; i++) {
                    me.remove(childNode[0]);
                }
            }

        },

        remove: function(node) {
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
                //nodeContainer.hide('fast', function() {
                nodeContainer.remove();
                //});
            }
            //nodeItem.hide('fast', function() {
            nodeItem.remove();
            //});

            var parentNode = me._parentNode(nodeData);
            //remove nodeData
            me._removeNode(nodeData);

            //updata parent nodeItem
            if (parentNode) {
                var parentNodeItem = me._findNodeItem(me._genNodeID(parentNode));
                var hasChild = me._hasChild(parentNode);
                if (!hasChild) {
                    if (parentNodeItem) {
                        //remove parent toggle icon
                        var parentToggleIcon = parentNodeItem.find('i.toggle-icon');
                        parentToggleIcon.removeClass();
                        //fix losting left offset
                        parentToggleIcon.addClass('toggle-icon');
                        parentToggleIcon.addClass('glyphicon');

                        //remove container
                        parentNodeItem.next().hide('fast', function() {
                            $(this).remove();
                        });
                    }
                }

                //rerender parent node icon
                me._reRenderNodeIcon(parentNodeItem, parentNode);
            }
        },

        expand: function(node) {
            var me = this;
            var nodeId = me._genNodeID(node);
            var nodeData = me._findNodeData(nodeId);

            me._triggerNodeExpandedEvent(nodeData);

            var hasChild = me._hasChild(nodeData);
            if (hasChild) {
                var nodeItem = me._findNodeItem(nodeId);
                var toggleIcon = nodeItem.find('i.toggle-icon');
                if (toggleIcon && toggleIcon.attr('class').indexOf(me._options.toggleIcon.collapseIcon) >= 0) {
                    var nodeContainer = nodeItem.next();
                    nodeContainer.show('fast');
                    toggleIcon.removeClass(me._options.toggleIcon.collapseIcon);
                    toggleIcon.addClass(me._options.toggleIcon.expandIcon);
                }
            }
        },

        collapse: function(node) {
            var me = this;
            var nodeId = me._genNodeID(node);
            var nodeData = me._findNodeData(nodeId);

            me._triggerNodeCollapsedEvent(nodeData);

            var hasChild = me._hasChild(nodeData);
            if (hasChild) {
                var nodeId = me._genNodeID(nodeData);
                var nodeItem = me._findNodeItem(nodeId);
                var toggleIcon = nodeItem.find('i.toggle-icon');
                if (toggleIcon && toggleIcon.attr('class').indexOf(me._options.toggleIcon.collapseIcon) < 0) {
                    var nodeContainer = nodeItem.next();
                    nodeContainer.hide('fast');
                    toggleIcon.removeClass(me._options.toggleIcon.expandIcon);
                    toggleIcon.addClass(me._options.toggleIcon.collapseIcon);
                }
            }
        },

        select: function(node) {
            var me = this;

            var nodeId = me._genNodeID(node);
            var nodeData = me._findNodeData(nodeId);
            if (me.selectedNode != nodeData) {
                if (me.selectedNode != null) {
                    me.disSelect();
                }
                var nodeItem = me._findNodeItem(nodeId);
                nodeItem.addClass('active');
                me.selectedNode = nodeData;
                me._triggerNodeSelectedEvent(nodeData);
            }
        },

        disSelect: function(node) {
            var me = this;
            if (me.selectedNode != null) {
                me._cleanSelection();
                me._triggerNodeDisSelectedEvent(me.selectedNode);
                me.selectedNode = null;
            }
        },

        _render: function() {
            var me = this;

            var data = me._options.data;
            for (index in data) {
                var nodeItem = $(TreePanel.prototype._template.nodeItem);
                me.$element.append(nodeItem);
                me._buildNode(nodeItem, data[index], 1);
            }

            me._subscribeEvents();
        },

        _reRenderNodeIcon: function(nodeItem, nodeData) {
            var me = this;
            if (typeof me._options.nodeIcon === 'function') {
                var iconClass = me._options.nodeIcon.call(me, nodeData);
                var nodeIcon = nodeItem.find('i.node-icon');
                nodeIcon.removeClass();
                nodeIcon.addClass('node-icon');
                nodeIcon.addClass(iconClass);
            }
        },

        _buildNode: function(nodeItem, nodeData, depth) {
            var me = this;
            nodeData = $(nodeData);
            var nodeID = me._genNodeID(nodeData);
            nodeItem.attr('data-nodeId', nodeID);

            //build indent
            for (var i = 1; i < depth; i++) {
                var nodeIndent = $(TreePanel.prototype._template.nodeIndent);
                nodeItem.append(nodeIndent);
            }

            //build toggle icon
            var toggleIcon = $(TreePanel.prototype._template.toggleIcon);
            nodeItem.append(toggleIcon);

            var toggleRender = me._options.toggleIcon.render;
            if (toggleRender != null && typeof toggleRender === 'function') {
                var toggleClass = toggleRender.call(me, nodeData[0], me._options.toggleIcon);
                toggleIcon.addClass(toggleClass);
            } else {
                if (me._options.childNodesField != '') {
                    var childNodes = nodeData.attr(me._options.childNodesField);
                    if (childNodes && childNodes.length > 0) {
                        if (depth <= me._options.expandDepth) {
                            toggleIcon.addClass(me._options.toggleIcon.expandIcon);
                        } else {
                            toggleIcon.addClass(me._options.toggleIcon.collapseIcon);
                        }
                    }
                }
            }

            //build node icon
            var nodeIcon = $(TreePanel.prototype._template.nodeIcon);
            var iconClass = me._options.nodeIcon;
            if (typeof me._options.nodeIcon === 'function') {
                iconClass = me._options.nodeIcon.call(me, nodeData[0]);
            }
            nodeIcon.addClass(iconClass);
            nodeItem.append(nodeIcon);

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

        _findNodeItem: function(nodeId) {
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

        _findNodeData: function(nodeId) {
            var me = this;

            var unique = me._getUniqueByNodeID(nodeId);
            var fieldName = me._options.valueField;
            if (fieldName == '') {
                fieldName = me._options.displayField;
            }
            var matchFilter = function($node) {
                if ($node.attr(fieldName) == unique) {
                    return true;
                }
                return false;
            };

            var resultArray = me._scanTreeData(matchFilter);
            return resultArray[0];
        },

        _scanTreeData: function(filterFun) {
            var me = this;

            if (filterFun && typeof filterFun === 'function') {
                var scanFunction = function(nodeArray) {
                    var result = [];
                    nodeArray.forEach(function(node) {
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

        _hasChild: function(nodeData) {
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

        _subscribeEvents: function() {
            var me = this;
            me._unSubscribeEvents();

            if (me._options.onNodeSelected && (typeof me._options.onNodeSelected === 'function')) {
                me.$element.on('nodeSelected', me._options.onNodeSelected);
            }
            if (me._options.onNodeDisSelected && (typeof me._options.onNodeDisSelected === 'function')) {
                me.$element.on('nodeDisSelected', me._options.onNodeDisSelected);
            }
            if (me._options.onNodeExpanded && (typeof me._options.onNodeExpanded === 'function')) {
                me.$element.on('nodeExpanded', me._options.onNodeExpanded);
            }
            if (me._options.onNodeCollapsed && (typeof me._options.onNodeCollapsed === 'function')) {
                me.$element.on('nodeCollapsed', me._options.onNodeCollapsed);
            }

            var nodeSelector = me._getNodeSelector();
            $(nodeSelector).on('click', $.proxy(me._elementClickHandler, me));
        },

        _unSubscribeEvents: function() {
            var me = this;

            var nodeSelector = me._getNodeSelector();
            $(nodeSelector).off('click');

            if (me._options.onNodeSelected && (typeof me._options.onNodeSelected === 'function')) {
                me.$element.off('nodeSelected');
            }
            if (me._options.onNodeDisSelected && (typeof me._options.onNodeDisSelected === 'function')) {
                me.$element.off('nodeDisSelected');
            }
            if (me._options.onNodeExpanded && (typeof me._options.onNodeExpanded === 'function')) {
                me.$element.off('nodeExpanded');
            }
            if (me._options.onNodeCollapsed && (typeof me._options.onNodeCollapsed === 'function')) {
                me.$element.off('nodeCollapsed');
            }
        },

        _elementClickHandler: function(event) {
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
                if (eventTarget.hasClass('toggle-icon')) {
                    var toggleIcon = currTarget.find('i.toggle-icon');
                    if (toggleIcon.attr('class').indexOf(me._options.toggleIcon.collapseIcon) >= 0) {
                        me.expand(nodeData);
                    } else {
                        me.collapse(nodeData);
                    }
                }
            }
        },

        _triggerNodeSelectedEvent: function(nodeData) {
            var me = this;
            me.$element.trigger('nodeSelected', [$.extend(true, {}, nodeData)]);
        },

        _triggerNodeDisSelectedEvent: function(nodeData) {
            var me = this;
            me.$element.trigger('nodeDisSelected', [$.extend(true, {}, nodeData)]);
        },

        _triggerNodeExpandedEvent: function(nodeData) {
            var me = this;
            me.$element.trigger('nodeExpanded', [$.extend(true, {}, nodeData)]);
        },

        _triggerNodeCollapsedEvent: function(nodeData) {
            var me = this;
            me.$element.trigger('nodeCollapsed', [$.extend(true, {}, nodeData)]);
        },

        _genNodeID: function(nodeData) {
            var me = this;
            var nodeID = 'node_';
            if (typeof nodeData === 'object') {
                var unique = me._getUniqueByNodeData(nodeData);
                nodeID = nodeID + unique;
            } else {
                nodeID = nodeID + nodeData;
            }

            return nodeID;
        },

        _getUniqueByNodeData: function(nodeData) {
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

        _getNodeText: function(nodeData) {
            var me = this;

            var text = $(nodeData).attr(me._options.displayField);
            return text;
        },

        _getNodeData: function(node) {
            var me = this;

            var nodeValue = node.toString();
            if (typeof node === 'object') {
                nodeValue = $(node).attr(me._options.valueField);
            }
            var matchFun = function($item) {
                if ($item.attr(me._options.valueField) == nodeValue) {
                    return true;
                }
            };
            return me._scanTreeData(matchFun)[0];
        },

        _cleanSelection: function() {
            var me = this;
            me._getNodeSelector().each(function() {
                $(this).removeClass('active');
            });
        },

        _getUniqueByNodeID: function(nodeId) {
            return nodeId.substring(5);
        },

        _getNodeSelector: function() {
            var me = this;
            var selector = '#' + me.$element.attr('id') + ' .list-group-item';
            return $(selector);
        },

        _nodeCounter: 0,
        _template: {
            nodeItem: '<a class="list-group-item" href="#"></a>',
            nodeContainer: '<span class="node-container"></span>',
            nodeIndent: '<span class="node-indent"></span>',
            toggleIcon: '<i class="toggle-icon glyphicon"></i>',
            nodeIcon: '<i class="node-icon"></i>'
        },
        _defaultOptions: {
            displayField: '',
            valueField: '',
            childNodesField: '',
            expandDepth: 2,
            toggleIcon: {
                render: null,
                expandIcon: 'glyphicon glyphicon-chevron-down',
                collapseIcon: 'glyphicon glyphicon-chevron-right',
            },
            nodeIcon: '',
            hasBorder: true,
            onNodeSelected: function(event, node) { },
            onNodeDisSelected: function(event, node) { },
            onNodeExpanded: function(event, node) { },
            onNodeCollapsed: function(event, node) { }
        },


        /*
        those function should be extend as class: TreeNode
        */
        _getDepth: function(node) {
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
        _parentNode: function(nodeData) {
            var me = this;

            var unique = me._getUniqueByNodeData(nodeData);
            var filter = function($node) {
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
        _childNodes: function(nodeData) {
            var me = this;

            var childNodes = [];
            if (me._options.childNodesField != '') {
                childNodes = $(nodeData).attr(me._options.childNodesField);
            }
            return childNodes;
        },
        _prevNode: function(nodeData) {
            var me = this;

        },
        _nextNode: function(nodeData) {
            var me = this;

        },
        _removeNode: function(nodeData) {
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
        _isChildNode: function(parentNode, childNode) {
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