# adressbook - A test project using AngularJS


# AngularJS Programming Task: Web interface for file conversion


Create a single page web application using AngularJS 1.5, Bootstrap and HTML5. There should not be any server, i.e. everything should run in the web browser.

It should be possible to both upload an input file and enter input in a text field.

It should be possible view an interactive tree of converted data, view XML output, and download the XML output.

The input format is line-based. The output format is XML.

Provide the solution in a repository on GitHub or Bitbucket.

## Input format:

  P|firstname|lastname
  T|mobile|fixed number
  A|street|city|postal code
  F|name|year of birth

P can be followed by T, A and/or F

F can be followed by T and/or A


# EXAMPLE

## Input:

	P|Carl Gustaf|Bernadotte
	T|0768-101801|08-101801
	A|Drottningholms slott|Stockholm|10001
	F|Victoria|1977
	A|Haga Slott|Stockholm|10002
	F|Carl Philip|1979
	T|0768-101802|08-101802
	P|Barack|Obama
	A|1600 Pennsylvania Avenue|Washington, D.C

## Output:

	<people>
	  <person>
	    <firstname>Carl Gustaf</firstname>
	    <lastname>Bernadotte</lastname>
	    <address>
	      <street>Drottningholms slott</street>
	      ...
	     </address>
	    <phone>
	      <mobile>0768-101801</mobile>
	      ...
	    </phone>
	    <family>
	      <name>Victoria</name>
	        <born>1977</born>
	        <address>...</address>
	     </family>
	     <family>...</family>
	  </person>
	  <person>...</person>
	</people>
