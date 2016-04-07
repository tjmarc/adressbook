var rawData = "P|Carl Gustaf|Bernadotte\r\nT|0768-101801|08-101801\nA|Drottningholms slott|Stockholm|10001\nF|Victoria|1977\nA|Haga Slott|Stockholm|10002\nF|Carl Philip|1979\r\nT|0768-101802|08-101802\rP|Barack|Obama\nA|1600 Pennsylvania Avenue|Washington, D.C";
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
function DataException(errorMsg) {
    this.message = errorMsg,
    this.name = DataException
}

// temporary - to be turned into validator
// in fact it may be ok to leave decision to the user if they want to fix the data or accept lesser issues
function isRowOK(entry) {
    var error, expectedLength;
    if ( ! /^[PFAT]$/.test(entry[0]) ) 
        error = "unknown row type " + entry[0];
    expectedLength = ( entry[0] == 'A' ) ? 4 : 3;
    if ( entry.length != expectedLength )
        error = 'row is too ' 
                + ( entry.length > expectedLength ? 'long' : 'short' )
                + '; expected ' + expectedLength + ' fields';
    if (error) {
        throw new DataException(error);
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
        throw new DataException("multiple phone numbers; leaving previous values intact");
    this.mobile = entry[1];
    this.fixedNumber = entry[2];
}

// both can have addresses
FamilyNode.prototype.setAddress = function(entry) {
    if (this.hasAddress()) 
        throw new DataException("multiple addresses; leaving previous values intact");
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


// we also need a simple CSV parser to split data lines into fields (returns array of arrays)
function parseCSV(rawData) {
    // Windows, Mac, or Unix?
    var lines = rawData.trim().split(/\r\n|\r|\n/);
    return lines.map(function(line) {
        return line.split(/\|/);
    });
}

// our main goal - a collection of persons and their family members, both types with additional data
function AddressBook() {
    this.person = [];
}

AddressBook.prototype.parseData = function(dataArray) {
    var entry, person, familyMember;
    var self = this;
    dataArray.forEach( function(entry, index, data ){
        try {
            if (entry[0] != 'P' && person == null) {
                throw new DataException("unidentified person - row omitted");
            }
            else {
                switch (entry[0]) {
                    case 'P': 
                        person = new Person(entry);
                        self.person.push(person);
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
            console.log("error at row " + index + ' (' + entry.join('|') + '): ' + e.message)
        }

    });
}

