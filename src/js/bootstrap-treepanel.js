
$.fn.treePanel = function (options) {
    var TreePanel = function (element, options) {
        var me = this;
        me.$element = $(element);
        me.selectedNode = null;

        if (options.data && (typeof options.data === 'string')) {
            options.data = $.parseJSON(options.data);
        }

        me._options = $.extend({}, TreePanel.prototype._defaultOptions, options);
        me._render();
    };

    TreePanel.prototype = {
        _nodeCounter: 0,

        remove: function (node) {
            var me = this;

            var nodeId = me._genNodeID(node);
            var nodeData = me._findNodeData(nodeId);
        },

        expand: function (node) {
            var me = this;
            var nodeId = me._genNodeID(node);
            var nodeItem = me._findNodeItem(nodeId);

            var nodeIcon = nodeItem.find('i.node-icon');
            if (nodeIcon && nodeIcon.attr('class').indexOf('glyphicon-chevron-right') >= 0) {
                var nodeContainer = nodeItem.next();
                nodeContainer.show('fast');
                nodeIcon.removeClass('glyphicon-chevron-right');
                nodeIcon.addClass('glyphicon-chevron-down');
            }
        },

        collapse: function (node) {
            var me = this;
            var nodeId = me._genNodeID(node);
            var nodeItem = me._findNodeItem(nodeId);

            var nodeIcon = nodeItem.find('i.node-icon');
            if (nodeIcon && nodeIcon.attr('class').indexOf('glyphicon-chevron-right') < 0) {
                var nodeContainer = nodeItem.next();
                nodeContainer.hide('fast');
                nodeIcon.removeClass('glyphicon-chevron-down');
                nodeIcon.addClass('glyphicon-chevron-right');
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
                var text = nodeData.attr(me._options.displayField);
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

                    nodeItem.parent().append(childContainer);

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

            var matchFun = function (nodesArray) {
                var result = [];
                nodesArray.forEach(function (node) {
                    var $node = $(node);
                    if ($node.attr(fieldName) == unique) {
                        result.push(node);
                        return result;
                    }
                    if (me._options.childNodesField != '') {
                        var childNodes = $node.attr(me._options.childNodesField);
                        if (childNodes) {
                            var childMatch = matchFun(childNodes);
                            result = result.concat(childMatch);
                        }
                    }
                });

                return result;
            };

            var nodeData = matchFun(me._options.data);
            return nodeData[0];
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
                if (nodeIcon.attr('class').indexOf('glyphicon-chevron-right') >= 0) {
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
        }
    };

    var treePanel = new TreePanel(this, options);
    return treePanel;
};