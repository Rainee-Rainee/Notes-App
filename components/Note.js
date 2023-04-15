import React, { useState } from 'react';
import styles from '@/styles/note.module.scss';

const Note = () => {
  const [textContent, setTextContent] = useState('');
  const [lastKeyPressed, setLastKeyPressed] = useState('');
  const [popUpMenuStyle, setPopUpMenuStyle] = useState({ display: 'none' });

  const handleChange = (e) => {
    e.preventDefault();
    console.log("'e': " + e.target.value);

    if (lastKeyPressed === '/') {
      console.log('MOOFDSJVMDGSSMIDV');
    }

    setTextContent(e.target.value);
  };

  const handleKeyDown = (e) => {
    setLastKeyPressed(e.key);
    console.log('Last key pressed: ' + e.key + ' | Type: ' + typeof e.key);
  };

  
  const getCaretPosition = (textareaElement, caretIndex) => {
    //Create a temporary span and div
    //The div will be used to create a mirror of the selected text up to the caret.
    //Then the span will contain a character at the caret which is offsetted by the mirrored text.
    //We can then get the position values that we want for popUpMenu by taking the posiiton values of the span offsetted by the mirrored text.
    const tempDiv = document.createElement("div");
    const tempSpan = document.createElement("span");
    
    //Mirror the style of the textarea text
    tempDiv.style.position = "absolute";
    tempDiv.style.top = "0";
    tempDiv.style.left = "0";
    tempDiv.style.whiteSpace = "pre-wrap";
    tempDiv.style.wordWrap = "break-word";
    tempDiv.style.font = getComputedStyle(textareaElement).font;
    tempDiv.style.visibility = "hidden"; //Hide it for the user
    
    //Get the text up to the caret and set the matching text to the temporary div
    const textUpToPosition = textareaElement.value.substring(0, caretIndex);
    tempDiv.textContent = textUpToPosition;

    //Get the character at the caret and set the character to the temporary span
    const characterAtPosition = textareaElement.value[caretIndex] || " "
    tempSpan.textContent = characterAtPosition;

    //Combine the "character at caret" with "text up to caret" by appendding the span to the div
    tempDiv.appendChild(tempSpan);
  
    // Set the div and span to the document by appendding the temporary div to the textarea element's parent 
    // The textarea element's parent is used over setting it directly to the element because textarea can't contain any other HTML elements.
    textareaElement.parentElement.appendChild(tempDiv);

    // Get the position values off of the span element
    const position = {
      offsetTop: tempSpan.offsetTop,
      offsetLeft: tempSpan.offsetLeft,
      offsetHeight: tempSpan.offsetHeight,
      offsetWidth: tempSpan.offsetWidth
    };
    console.log(position);
  
    //Remove the div and span when finished and return the position values
    textareaElement.parentElement.removeChild(tempDiv);
    return position;
  };


  const handleSelect = (e) => {
    e.preventDefault();
    console.log("e.target: " + e.target);
    const selectionStart = e.target.selectionStart;
    const selectionEnd = e.target.selectionEnd;
  
    if (selectionStart === selectionEnd) {
      setPopUpMenuStyle({ display: "none" });
      return;
    }
  
    
    const textareaBoundingRect = e.target.getBoundingClientRect();
    console.log("textareaBoundingRect: " + textareaBoundingRect);
    const caretPosition = getCaretPosition(e.target, selectionStart);
    console.log("caretPosition: " + caretPosition);

    //Calculate popUpMenu position
    const menuTop = textareaBoundingRect.top + caretPosition.offsetTop - 20;
    const menuLeft = textareaBoundingRect.left + caretPosition.offsetLeft;
  
    
    setPopUpMenuStyle({
      display: "block",
      position: "absolute",
      top: `${menuTop}px`,
      left: `${menuLeft}px`,
    });
  };

  return (
    <div className={styles.noteContainer}>
      <textarea
        className={styles.note}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onSelect={handleSelect}
        value={textContent}
      ></textarea>
      <div 
        className={styles.popUpMenu} 
        style={popUpMenuStyle}>
        abc
      </div>
    </div>
  );
};

export default Note;