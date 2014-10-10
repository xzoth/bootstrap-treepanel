#Bootstrap Tree Panel
A simple tree view plugin for Bootstrap

##Requirements
- [Bootstrap v3.0.3][1]  
- [jQuery v2.1.0][2]  

##Usage
define a holder: 


    <div id="tree" class="list-group"></div>


basic usage may looks like this:


	var options = {
                valueField: 'number',
                displayField: 'name',
                childNodesField: 'nodes',
                data: '[{ "number": 101, "name": "Top 1" }, { "number":102, "name":"Top 2", "nodes":[{ "number":201, "name":"Second 1", "nodes": [{ "number": 301, "name": "Third 1" }] }, {"number":202, "name":"Second 2"}] }]'
    };
	var treePanel = $("#tree").treePanel(options);


##License
New BSD License

Copyright (c) 2014, Laxton GZ All rights reserved.  

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:  

- Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.  
- Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.  
- Neither the name of Laxton GZ nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.  

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.







[1]: http://getbootstrap.com
[2]: https://jQuery.org