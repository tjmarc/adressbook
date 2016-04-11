angular.module('addressbook', ['ui.bootstrap', 'angularTreeview']);

var app = angular.module('addressbook');

app.service('PeopleData', function() {
  var csv = '';
  var data = [];
  var parserLog = '';
  var object = {};
  var treeData = [];
  var xml = '';
  var mustRebuild = false;
  
  this.csvParser = function() {
    console.log('csvParser:');
    console.log('csv:'+csv.length+' bytes');
    // Windows, Mac, or Unix?
    var lines = csv.trim().split(/\r\n|\r|\n/);
    data = lines.map(function(line) {
        return line.split(/\|/);
    });
    console.log('data:'+data.length+' rows');
  }

  this.objectBuilder = function() {
    console.log('objectBuilder:');
    console.log('data:'+data.length+' rows');
    var addressBook = new AddressBook();
    addressBook.parseData(data);
    object = addressBook.people;
    parserLog = addressBook.parserLog.list();
    console.log('object:'+object.person.length+' persons');
    addressBook.prepareTreeData();
    treeData = addressBook.treeData;
    console.log('treeData:'+treeData.length+' persons');
  };

  this.xmlBuilder = function() {
    console.log('xmlBuilder:');
    console.log('object:'+object.person.length+' persons');
    var x2js = new X2JS();
    xml = x2js.json2xml_str(object);
    console.log('xml:'+xml.length+' bytes');
  };

  this.rebuild = function(csv) {
    if (this.mustRebuild) {
      console.log('rebuilding...');
      this.csv = csv;
      this.csvParser();
      this.objectBuilder();
      this.xmlBuilder();
      this.mustRebuild = false;
      console.log('done.');
    }
  }

  this.setCSV = function(input) {
    console.log('setCSV:');
    csv = input;
    this.mustRebuild = true;
    console.log('csv:'+csv.length+' bytes');
    this.rebuild();
  };

  this.getCSV = function() {
    return csv;
  };

  this.getParserLog = function() {
    return parserLog;
  };

  this.getObject = function() {
    return object;
  };

  this.getTreeData = function() {
    return treeData;
  };

  this.getXML = function() {
    return xml;
  };

});

app.controller('UploadCtrl', function($scope, $filter, PeopleData) {

  $scope.files = [];

  $scope.handler=function(e,files){
    var reader=new FileReader();
    reader.onload=function(e){
        $scope.csv = reader.result;
        PeopleData.setCSV($scope.csv);
    }
    if (files[0] instanceof Blob)
      reader.readAsText(files[0]);
  }

  // tried to reset file upload input, but this doesn't work as expected 
  $scope.$watch(
    function() {
      return PeopleData.getCSV();
    },                       
    function(newValue, oldValue) {
      if (newValue !== oldValue) {
        $scope.files = undefined; 
        console.log('files erased');
      }
    }, 
    true
  );


});

app.controller('InputCtrl', function($scope, $filter, PeopleData) {
  $scope.csv = PeopleData.getCSV();
  $scope.parserLog = PeopleData.getParserLog();

  $scope.$watch(
    'csv',                       
    function(newValue, oldValue) {
      if (newValue !== oldValue) {
        PeopleData.setCSV(newValue); 
        console.log('setCSV: '+newValue.length+' bytes');
      }
    }, 
    true
  );

  $scope.$watch(
    function() {
      return PeopleData.getCSV();
    },                       
    function(newValue, oldValue) {
      if (newValue !== oldValue) {
        $scope.csv = newValue; 
        console.log('getCSV: '+newValue.length+' bytes');
      }
    }, 
    true
  );

   $scope.$watch(
    function() {
      return PeopleData.getParserLog();
    },                       
    function(newValue, oldValue) {
      if (newValue !== oldValue) {
        $scope.parserLog = newValue; 
        console.log('getParserLog: '+newValue.length+' bytes');
      }
    }, 
    true
  );
});

app.controller('TreeCtrl', function($scope, $filter, PeopleData) {
  $scope.object = PeopleData.getObject();
  $scope.treeData = PeopleData.getTreeData();

  $scope.$watch(
    function() {
      return PeopleData.getObject();
    },                       
    function(newValue, oldValue) {
      if (newValue !== oldValue) {
        $scope.object = newValue; 
        console.log('getObject: '+newValue.person.length+' persons');
      }
    }, 
    true
  );

   $scope.$watch(
    function() {
      return PeopleData.getTreeData();
    },                       
    function(newValue, oldValue) {
      if (newValue !== oldValue) {
        $scope.treeData = newValue; 
        console.log('getTreeData: '+newValue.length+' persons');
      }
    }, 
    true
  );

});

app.controller('OutputCtrl', function($scope, $filter, PeopleData) {
  $scope.xml = PeopleData.getXML();

  $scope.$watch(
    function() {
      return PeopleData.getXML();
    },                       
    function(newValue, oldValue) {
      if (newValue !== oldValue) {
        $scope.xml = newValue; 
      }
    }, 
    true
  );

});

app.filter('prettyXML', function() {
  return function(input) {
    return vkbeautify.xml(input, 2);
  };
});

app.directive('fileChange',['$parse', function($parse){
  return{
    require:'ngModel',
    restrict:'A',
    link:function($scope,element,attrs,ngModel){
      var attrHandler=$parse(attrs['fileChange']);
      var handler=function(e){
        $scope.$apply(function(){
          attrHandler($scope,{$event:e,files:e.target.files});
        });
      };
      element[0].addEventListener('change',handler,false);
    }
  }
}]);

app.directive('xmlDownload', function ($compile, PeopleData) {
    return {
        restrict:'E',
        scope: true,
        link:function (scope, element, attrs) {
          scope.$watch('xml', function(newValue, oldValue) {
            if (newValue !== oldValue) {
              scope.url = URL.createObjectURL(new Blob([scope.xml], {type: "application/xml"}));
              
              element.empty().append($compile(
                '<a class="btn" download="addressbook.xml" '
                + 'href="' + scope.url + '">' + 'Download' + '</a>'
              )(scope));
            }
          }, true);
        }
    };
});  


