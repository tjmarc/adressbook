angular.module('addressbook', ['ui.bootstrap']);

/* solution based on:
http://stackoverflow.com/questions/28070374/parsing-a-csv-file-provided-by-an-input-in-angular
http://stackoverflow.com/questions/24080602/parsing-csv-in-javascript-and-angularjs
http://stackoverflow.com/questions/16947771/how-do-i-ignore-the-initial-load-when-watching-model-changes-in-angularjs
http://stackoverflow.com/questions/376373/pretty-printing-xml-with-javascript
*/

angular.module('addressbook').controller('MainCtrl', function($scope, $filter) {

  $scope.model = {
    data: 'Please paste your data here',
    xml: ''
  };

  $scope.files = [];

  $scope.handler=function(e,files){
    var reader=new FileReader();
    reader.onload=function(e){
        $scope.model.data = reader.result;
    }
    reader.readAsText(files[0]);
  }


  $scope.$watch('model.data', function(newValue, oldValue){
    if (newValue !== oldValue) {
      $scope.model.addressbook = { people: $filter('csvToObj')(newValue) };
    }
  },true);

  $scope.$watch('model.addressbook', function(newValue, oldValue){
    if (newValue !== oldValue) {
      $scope.model.xml = $filter('objToXML')(newValue);
    }
  },true);

  $scope.getBlob = function(){
    return new Blob([$scope.model.xml], {type: "application/xml"});
  }


});

angular.module('addressbook').filter('csvToObj', function() {
  return function(input) {
    var dataArray = parseCSV(input);
    var addressBook = new AddressBook();
    addressBook.parseData(dataArray);
    return addressBook.people;
  };
});

angular.module('addressbook').filter('objToXML', function() {
  return function(input) {
    var x2js = new X2JS();
    return x2js.json2xml_str(input);
  };
});

angular.module('addressbook').filter('prettyXML', function() {
  return function(input) {
    return vkbeautify.xml(input, 2);
  };
});

angular.module('addressbook').directive('fileChange',['$parse', function($parse){
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

angular.module('addressbook').directive('xmlDownload', function ($compile) {
    return {
        restrict:'E',
        scope:{ getUrlData:'&getData'},
        link:function (scope, element, attrs) {
            var url = URL.createObjectURL(scope.getUrlData());
            element.append($compile(
                '<a class="btn" download="addressbook.xml" ' +
                    'href="' + url + '">' +
                    'Download' +
                    '</a>'
            )(scope));
        }
    };
});  

