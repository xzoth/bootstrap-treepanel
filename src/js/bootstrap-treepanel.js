
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
                var nodeItem = me._buildNode(data[index], 1);
                me.$element.append(nodeItem);
            }
        },

        _buildNode: function (nodeData, depth) {
            var me = this;

            nodeData = $(nodeData);
            var nodeItem = $(TreePanel.prototype._template.nodeItem);

            //build indent
            for (var i = 1; i < depth; i++) {
                var nodeIndent = $(TreePanel.prototype._template.nodeIndent);
                nodeItem.append(nodeIndent);
            }

            //build icon
            if (me._options.childNodesField != '') {
                var childNodes = nodeData.attr(me._options.childNodesField);
                if (childNodes.length > 0) {
                    var nodeIcon = $(TreePanel.prototype._template.nodeIcon);
                    nodeIcon.addClass(me._options.collapseIcon);
                    nodeItem.append(nodeIcon);
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

            return nodeItem;
        },

        _findNodeData: function (attr, value) {
            var me = this;

            var data = me._options.data;

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