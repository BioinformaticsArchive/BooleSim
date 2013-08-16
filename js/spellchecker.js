
/*
 * Basic spellchecker for JavaScript Boolean networks
 */
SpellChecker = function(_idTextarea, _idParentDiv, _lineHeight) {

        obj = {
                textarea:   document.getElementById(_idTextarea),
                parent:     $('#'+_idParentDiv),
                lineHeight: _lineHeight,
                warningByLine: {}
        };

        /*
         * Remove red triangle from line <lineNumber>
         */
        obj.hideWarning = function(lineNumber) {
            $('#spellcheckWarning'+lineNumber).remove();
        };

        /*
         * Draw a red triangle on line <lineNumber>
         */
        obj.showWarning = function(lineNumber, msgError){
            if (this.warningByLine[lineNumber] != undefined)
                this.hideWarning(lineNumber);
            var y = this.textarea.offsetTop + (lineNumber*this.lineHeight) + 5;
            var x = this.textarea.offsetLeft - 20;
            this.warningByLine[lineNumber] = this.parent.append('<img src="img/warning.svg" id="spellcheckWarning'+lineNumber+'" class="spellcheckWarning" title="'+msgError+'" style="left:'+x+'px;top:'+y+'px;"/>');
        };

        /*
         * Internal helper function:
         * Check syntax
         */
        obj.checkSyntax = function(currentLine) {
            
            // empty lines can not have errors 
            if (currentLine.trim().length == 0)
                return null;
            
            // check if exactly one "=" is present
            if (currentLine.split('=').length != 2)
                return 'Incorrect usage of equality sign';
            
            // check for illegal characters
            if (currentLine.match(/[A-Za-z0-9_&\|!= ]+/g)[0].length != currentLine.length)
                return 'Illegal character';
            
            // check for accidental use of "and", "or", "not"
            if ((/\b(and)\b/gi).test(currentLine) || (/\b(or)\b/gi).test(currentLine) || (/\b(not)\b/gi).test(currentLine))
                return 'Please use JavaScript syntax for AND / OR / NOT';
            
            // check if all node names are properly interrupted by and/or
            // extract right side of equation
            var l = currentLine.split('=')[1];
            // remove brackets and "not"s
            l = l.replace(/()!/g,' ');
            // separate node names from logical operators, treat AND and OR equally
            l = l.replace(/(&|\|){2}/g,' % '); // http://www.w3schools.com/jsref/jsref_obj_regexp.asp
            // split rule into whole words
            var ls = l.match(/[A-Za-z0-9_%]+/g);
            if (ls.length > 0) {
                if (ls[0] == '%')
                    return 'Equation must not start with a logical operator';
                if (ls[ls.length-1] == '%')
                    return 'Equation must not end with a logical operator';
                for (var i=0; i<=ls.length-3; i+=2) {
                    if (ls[i] == '%' || ls[i+1] != '%' || ls[i+2] == '%')
                        return 'Logical problem between nodes '+ls[i]+' and '+ls[i+2];
                };
            }
            
            // check for unclosed brackets
            if (currentLine.split('(').length != currentLine.split(')').length)
                return 'Number of opened and closed brackets is not identical';
            
            // check for missing logical operator
            if (currentLine.replace(' ','').indexOf(')(') > -1)
                return 'Logical operator missing between brackets';
            
            // check for conflicting target rules
            var remainingLines = this.textarea.value.replace(currentLine,'').split('\n');
            var targets = [];
            for (var i=0; i<remainingLines.length; i++) {
                var line = remainingLines[i];
                targets.push( line.split('=')[0].trim() );
            }
            if (targets.indexOf(currentLine.split('=')[0].trim()) > -1) 
                return 'Rule conflict: Target node already defined elsewhere';
            
            return null;
        };

        /*
         * Check JavaScript Boolean network syntax on current line (only line of cursor position)
         */
        obj.check = function() {
            var cursor = this.textarea.selectionStart;
            var untilCursor = this.textarea.value.substr(0, cursor);
            var currentLineNumber = untilCursor.split('\n').length - 1;
            var currentLine = this.textarea.value.split('\n')[currentLineNumber];
            var msg = this.checkSyntax(currentLine);
            if (msg != null)
                this.showWarning(currentLineNumber, msg);
            else
                this.hideWarning(currentLineNumber);
        };
        
        return obj;
};

spell = SpellChecker('textRules', 'tabEditor', 18);

SpellCheck = function(event) {
    rulesChanged = true;
    spell.check();
};

