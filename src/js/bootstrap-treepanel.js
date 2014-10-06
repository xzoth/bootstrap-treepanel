
$.fn.treePanel = function (options) {
    var TreePanel = function (element, options) {
        var me = this;
        me.$element = $(element);

        if (options.data) {
            if (typeof options.data == 'string') {
                options.data = $.parseJSON(options.data);
            }
        }
        me._options = $.extend({}, TreePanel.prototype._defaultOptions, options);
        me._render();
    };

    TreePanel.prototype = {
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
                    nodeIcon.addClass(me._options.collapseIcon);
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
                    var childDepth = ++depth;
                    var childContainer = $(TreePanel.prototype._template.nodeContainer);

                    for (index in childNodes) {
                        var childNodeItem = $(TreePanel.prototype._template.nodeItem);
                        childContainer.append(childNodeItem);
                        me._buildNode(childNodeItem, childNodes[index], childDepth);
                    }

                    nodeItem.parent().append(childContainer);
                }
            }

            return nodeItem;
        },

        _findNodeData: function (attr, value) {
            var me = this;
            var data = me._options.data;
        },

        _subscribeEvents: function () {
            var me = this;
            me._unSubscribeEvents();
            
            var nodeSelector = me._getNodeSelector();
            $(nodeSelector).click(function (event) {
                var eventTarget = $(event.target);
                var currTarget = $(event.currentTarget);

                if (eventTarget[0].tagName == 'A') {
                    eventTarget.toggleClass('active');
                } else if (eventTarget[0].tagName == 'I') {
                    var nodeContainer = currTarget.next();
                    nodeContainer.toggle('fast');

                    var nodeIcon = currTarget.find('i.node-icon');
                    if (nodeIcon.attr('class').indexOf('glyphicon-chevron-right') > 0) {
                        nodeIcon.removeClass('glyphicon-chevron-right');
                        nodeIcon.addClass('glyphicon-chevron-down');
                    } else {
                        nodeIcon.removeClass('glyphicon-chevron-down');
                        nodeIcon.addClass('glyphicon-chevron-right');
                    }
                }
            });
        },

        _unSubscribeEvents: function () {
            var me = this;

            var nodeSelector = me._getNodeSelector();
            $(nodeSelector).off('click');
        },

        _getNodeSelector: function () {
            var me = this;
            var selector = '#' + me.$element.attr('id') + ' .list-group-item';
            return selector;
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
            expandIcon: 'glyphicon-chevron-down',
            collapseIcon: 'glyphicon-chevron-right',
            backColor: '',
            borderColor: '',
            hoverColor: '',
            hasBorder: true,
            isHighlightSelected: true,
            isEnableLinks: false
        }
    };

    var treePanel = new TreePanel(this, options);
    return treePanel;
};