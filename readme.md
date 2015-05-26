#Bootstrap Tree Panel
A simple tree view plugin for Bootstrap

[DEMO](http://xzoth.github.io/bootstrap-treepanel/ "DEMO")

##Requirements
- [Bootstrap v3.0.3][1] +  
- [jQuery v2.1.0][2] +

##Usage
###1. resources reference:

    <link href="bootstrap.min.css" rel="stylesheet" />
    <link href="bootstrap-treepanel.css" rel="stylesheet" />

    <script src="jquery-2.1.0.min.js"></script>
    <script src="bootstrap.min.js"></script>
    <script src="bootstrap-treepanel.js"></script>


###2. define a holder: 


    <div id="tree" class="list-group"></div>

###3. duang duang duang
basic usage may looks like this:


	var options = {
                valueField: 'number',
                displayField: 'name',
                childNodesField: 'nodes',
                data: '[{ "number": 101, "name": "Top 1" }, { "number":102, "name":"Top 2", "nodes":[{ "number":201, "name":"Second 1", "nodes": [{ "number": 301, "name": "Third 1" }] }, {"number":202, "name":"Second 2"}] }]'
    };
	var treePanel = $("#tree").treePanel(options);


##Options
options is an object for initialization function, that allow you to customise treepanel's default UI & behaviour.

###data  
JSON array string of objects, to display the treepanel.  
Type: String  
IsRequire: true  
Default:none

###displayField
property name of object in data, property value will display on treepanel.    
Type: String     
IsRequire: true  
Default:none

###valueField
property name of object in data, peropety value should unique the object. like ID. 
Type: String      
IsRequire: true   
Default:none

###childNodesField
property name of object in data, property value should be a JSON array of object's child nodes.  
Type: String      
IsRequire: true   
Default:none

###expandDepth
sets the number of levels deep the treepanel will be expanded to by default.  
Type: Integer      
IsRequire: false   
Default: 1

###expandIcon
sets the icon to be used on an expandable tree node.  
Type: String      
IsRequire: false   
Default: glyphicon-chevron-down

###collapseIcon
sets the icon to be used on an collapsed tree node.  
Type: String      
IsRequire: false   
Default: glyphicon-chevron-right

###hasBorder
sets whether or not the treepanel has a border.  
Type: Boolean      
IsRequire: false   
Default: true


##Methods
Methods provide a way of interacting with the plugin programmatically. you can control the treepanel via invoke method. 

all methods 'node' parameter accepts node or nodeId.

###add(node, [parent], [index])
add a new tree node to treepanel.

    treePanel.add('{ "number": 103, "name": "Top 3" }');

###update(node)
update a tree node which valueFiled equal to parameter one.

    treePanel.update({ number: treePanel.selectedNode.number, name: 'hi' });

###move(node, [parent], [index])
move a tree node.

    treePanel.move('201', '101');

###remove(node)
remove a tree node.

    treePanel.remove(treePanel.selectedNode)
triggers ***onNodeDisSelected*** event, if removed node is current selected one.

###expand(node)
expand a given tree node if it's expandable.

    treePanel.expand('102');

###collapse(node)
collapse a given tree node if it's collapseable.

    treePanel.collapse({ number: 102 });


###select(node)
selects a given tree node.

    treePanel.select({ number: 102 });

###disSelect([node])
disselect a given tree node, otherwise disselect current selected node.

    treePanel.disSelect();


##Events

###onNodeSelected
###onNodeDisSelected


##License
New BSD License

Copyright (c) 2014, All rights reserved.  

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:  

- Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.  
- Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.  
- Neither the name of vigo nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.  

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.







[1]: http://getbootstrap.com
[2]: https://jQuery.org