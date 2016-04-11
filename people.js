/* Our business logic:
All constructors and setters of FamilyNode and its descendants accept a unique parameter, entry. 
Its a list in fixed format. 
Depending on its 0-th value, it can contain details of a person, their family member, adress, or phone numbers:
   P|firstname|lastname
   F|name|year of birth
   A|street|city|postal code
   T|mobile|fixed number
P can be followed by T, A and F
F can be followed by T and A
*/

// a simple exception class
function DataException(errorType,errorMsg) {
    this.type = errorType,
    this.message = errorMsg,
    this.name = 'DataException'
}

// a container for logging parser warnings and errors
function ParserLog() {
    this.logger = [];
}
ParserLog.prototype.log = function(message){
    this.logger.push(message);
}
ParserLog.prototype.list = function(){
    return this.logger.join('\r\n');
}

// temporary - to be turned into validator
// in fact it may be ok to leave decision to the user if they want to fix the data or accept lesser issues
function isRowOK(entry) {
    var error, expectedLength;
    if ( ! /^[PFAT]$/.test(entry[0]) ) 
        throw new DataException("error", "unknown row type " + entry[0]);
    expectedLength = ( entry[0] == 'A' ) ? 4 : 3;
    if ( entry.length != expectedLength )
        error = 'row is too ' 
                + ( entry.length > expectedLength ? 'long' : 'short' )
                + '; expected ' + expectedLength + ' fields';
    if (error) {
        throw new DataException("warning", error);
    }
}

// a superclass for both persons and their family members
function FamilyNode() {
}
FamilyNode.prototype.hasPhoneNumbers = function() {
    return Boolean( this.mobile || this.fixedNumber );
}
FamilyNode.prototype.hasAddress = function() {
    return Boolean( this.street || this.city || this.postalCode );
}

// both can have phones
FamilyNode.prototype.setPhoneNumbers = function(entry) {
    if (this.hasPhoneNumbers()) 
        throw new DataException("warning", "multiple phone numbers; leaving previous values intact");
    this.mobile = entry[1];
    this.fixedNumber = entry[2];
}

// both can have addresses
FamilyNode.prototype.setAddress = function(entry) {
    if (this.hasAddress()) 
        throw new DataException("warning", "multiple addresses; leaving previous values intact");
    this.street = entry[1];
    this.city = entry[2];
    this.postalCode = entry[3];
}

// a person has first and last name
function Person(entry) {
    FamilyNode.call(this);
    this.firstname = entry[1];
    this.lastname = entry[2];
}
Person.prototype = Object.create(FamilyNode.prototype);
Person.prototype.constructor = Person;
Person.prototype.hasFamilyMembers = function() {
    return Boolean( this.family && this.family.length );
}

// a person can have family members
Person.prototype.addFamilyMember = function(familyMember) {
    if (!this.hasFamilyMembers())  {
        this.family = [];
    }
    this.family.push(familyMember);
}

// a family member can have (first) name and birth year
function FamilyMember(entry) {
    FamilyNode.call(this);
    this.name = entry[1];
    this.born = entry[2];
}
FamilyMember.prototype = Object.create(FamilyNode.prototype);
FamilyMember.prototype.constructor = FamilyMember;

// our main goal - a collection of persons and their family members, both types with additional data
function AddressBook() {
    this.people = {person:[]};
}

AddressBook.prototype.parseData = function(dataArray) {
    var entry, person, familyMember;
    var self = this;
    this.parserLog = new ParserLog();
    dataArray.forEach( function(entry, index, data ){
        try {
            if (entry[0] != 'P' && person == null) {
                throw new DataException("error", "unidentified person - row omitted");
            }
            else {
                switch (entry[0]) {
                    case 'P': 
                        person = new Person(entry);
                        self.people.person.push(person);
                        familyMember = null;
                        break;
                    case 'F':
                        familyMember = new FamilyMember(entry);
                        person.addFamilyMember(familyMember);
                        break;
                    case 'A':
                        (familyMember || person).setAddress(entry);
                        break;
                    case 'T':
                        (familyMember || person).setPhoneNumbers(entry);
                        break;
                }
            }
            isRowOK(entry);

        }
        catch(e){ 
            self.parserLog.log(e.type+" at row " + (index +1) + ' (' + entry.join('|') + '): ' + e.message)
        }

    });
}

AddressBook.prototype.prepareTreeData = function() {
  var treeData = [];
  this.people.person.forEach( function(person, index, data) {
    var node = { 
      nodeValue: person.firstname + " " + person.lastname,
      nodeId: "person_" + index,
      children: [
        { nodeValue: "first name: " + person.firstname, nodeId: "person_" + index + '_firstname', children: [] },
        { nodeValue: "last name: " + person.lastname, nodeId: "person_" + index + '_lastname', children: [] },
      ] 
    };
    if (person.mobile || person.fixedNumber) {
      var phoneNumbers = { 
        nodeValue: "phone numbers", 
        nodeId: "person_" + index + '_phonenumbers',
        children: [
          { nodeValue: "mobile: " + person.mobile, nodeId: "person_" + index + '_mobile', children: [] },
          { nodeValue: "fixed number: " + person.fixedNumber, nodeId: "person_" + index + '_fixednumber', children: [] },
        ]
      };
      node.children.push(phoneNumbers);
    }
    if (person.city || person.street || person.postalCode) {
      var address = { 
        nodeValue: "address", 
        nodeId: "person_" + index + '_address',
        children: [
          { nodeValue: "street: " + person.street, nodeId: "person_" + index + '_street', children: [] },
          { nodeValue: "city: " + person.city, nodeId: "person_" + index + '_city', children: [] },
          { nodeValue: "postal code: " + person.postalCode, nodeId: "person_" + index + '_postalcode', children: [] },
        ]
      };
      node.children.push(address);
    }
    if (person.family && person.family.length) {
      var family = { nodeValue: person.family.length + " family member(s)", children: [] };
      var memberId = "person_" + index + "_familymember";
      var members = family.children;
      person.family.forEach( function(member,index,data) {
        var node = { 
          nodeValue: member.name,
          nodeId: memberId + index,
          children: [
            { nodeValue: "name: " + member.name, nodeId: memberId + index + '_name', children: [] },
            { nodeValue: "born: " + member.born, nodeId: memberId + index + '_born', children: [] },
          ] 
        };
        if (member.mobile || member.fixedNumber) {
          var phoneNumbers = { 
            nodeValue: "phone numbers", 
            nodeId: memberId + index + '_phonenumbers',
            children: [
              { nodeValue: "mobile: " + member.mobile, nodeId: memberId + index + '_mobile', children: [] },
              { nodeValue: "fixed number: " + member.fixedNumber, nodeId: memberId + index + '_fixednumber', children: [] },
            ]
          };
          node.children.push(phoneNumbers);
        }
        if (member.city || member.street || member.postalCode) {
          var address = { 
            nodeValue: "address", 
            nodeId: memberId + index + '_address',
            children: [
              { nodeValue: "street: " + member.street, nodeId: memberId + index + '_street', children: [] },
              { nodeValue: "city: " + member.city, nodeId: memberId + index + '_city', children: [] },
              { nodeValue: "postal code: " + member.postalCode, nodeId: memberId + index + '_postalcode', children: [] },
            ]
          };
          node.children.push(address);
        }
        members.push(node);
      });
      node.children.push(family);
    }
    treeData.push(node);
  });
  this.treeData = treeData;
}

