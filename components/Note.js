import React, { useState, useRef, useLayoutEffect } from 'react';
import styles from '@/styles/note.module.scss';

const Note = () => {
  const [textContent, setTextContent] = useState('');
  const [lastKeyPressed, setLastKeyPressed] = useState('');
  const [popUpMenuStyle, setPopUpMenuStyle] = useState({ visibility: 'hidden' });
  const [leftestPopUpMenuItemStyle, setLeftestPopUpMenuItemStyle] = useState({borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px'});
  const [rightestPopUpMenuItemStyle, setRightestPopUpMenuItemStyle] = useState({borderTopRightRadius: '8px', borderBottomRightRadius: '8px'});
  const [menuDimensions, setMenuDimensions] = useState({ height: 0, width: 0 });
  const [noteArea, setNoteArea] = useState(null);

  const popUpMenuRef = useRef(null);
  
  useLayoutEffect(() => {
    if (popUpMenuRef.current && popUpMenuStyle.visibility === 'visible') {
      setMenuDimensions({
        height: popUpMenuRef.current.offsetHeight,
        width: popUpMenuRef.current.offsetWidth,
      });
    }
  }, [popUpMenuStyle]);
  
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
    tempDiv.style.backgroundColor = "#ebf2ed";
    tempDiv.style.font = getComputedStyle(textareaElement).font;
    tempDiv.style.left = "0";
    tempDiv.style.opacity = ".33";
    tempDiv.style.position = "absolute";
    tempDiv.style.top = "0";
    tempDiv.style.visibility = "hidden"; //Hide it for the user
    tempDiv.style.whiteSpace = "pre-wrap";
    tempDiv.style.width = `${textareaElement.clientWidth}px`;
    tempDiv.style.wordWrap = "break-word";
    
    
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
      offsetTop: tempSpan.offsetTop + window.pageYOffset - textareaElement.scrollTop,
      offsetLeft: tempSpan.offsetLeft + window.pageXOffset - textareaElement.scrollLeft,
      offsetHeight: tempSpan.offsetHeight,
      offsetWidth: tempSpan.offsetWidth
    };
    console.log(position);
  
    //Remove the div and span and return the position values when finished
    textareaElement.parentElement.removeChild(tempDiv);
    return position;
  };


  const handleSelect = (e) => {
    e.preventDefault();
    console.log("e.target: " + e.target);
    setNoteArea(e.target);
    const selectionStart = e.target.selectionStart;
    const selectionEnd = e.target.selectionEnd;
  
    if (selectionStart === selectionEnd) {
    setPopUpMenuStyle({ visibility: "hidden" });
      return;
    }
  
    const textareaBoundingRect = e.target.getBoundingClientRect();
    console.log("textareaBoundingRect: " + textareaBoundingRect);
    const caretPosition = getCaretPosition(e.target, selectionStart);
    console.log("caretPosition: " + caretPosition);

    //Calculate popUpMenu position
    let menuTop;
    let menuLeft;
    let menuRight;
    let menuHeight = menuDimensions.height;
    let menuWidth = menuDimensions.width;
    //If the caret position is offsetted by at least the menu's height away from the top of the textarea
    //then that means there's room to render the menu above the caret position
    if (caretPosition.offsetTop >= menuHeight){
        //set the menuTop variable to render the menu above the caret position
        menuTop = textareaBoundingRect.top + caretPosition.offsetTop - 30;
    }
    // else if caret position isn't offsetted by at least the menu's height away from the top of the textarea, 
    // then that means there's no room to render the menu above the caret position without going outside of the textarea
    else if (caretPosition.offsetTop < menuHeight){
        // so set the menuTop variable to render the menu below the caret position instead
        menuTop = textareaBoundingRect.top + caretPosition.offsetTop + 30;
    } 
    
    // If the right side of the menu is outside the textarea
    menuRight = textareaBoundingRect.left + caretPosition.offsetLeft + menuDimensions.width;
    if (menuRight > textareaBoundingRect.right){
        // then subtract by how much amount that the menu is outside the text area by before setting the left offset
        const overflowDifference = menuRight - textareaBoundingRect.right
        menuLeft = textareaBoundingRect.left + caretPosition.offsetLeft - overflowDifference;
    } else {
        // else set the left offset normally
        menuLeft = textareaBoundingRect.left + caretPosition.offsetLeft;
    }
    
    setPopUpMenuStyle({
        visibility: "visible",
        position: "absolute",
        top: `${menuTop}px`,
        left: `${menuLeft}px`,
      });
  };

  const handleBold = (e) => {
    e.preventDefault();
    const selectionStart = noteArea.selectionStart;
    const selectionEnd = noteArea.selectionEnd;

    if (selectionStart === selectionEnd) {
        return;
    }

    const beforeSelectedText = textContent.slice(0, selectionStart);
    const selectedText = textContent.slice(selectionStart, selectionEnd);
    const afterSelectedText = textContent.slice(selectionEnd);

    setTextContent(`${beforeSelectedText}<b>${selectedText}</b>${afterSelectedText}`);

    
  }

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
        id = "popUpMenuID"
        ref={popUpMenuRef}
        className={styles.popUpMenu} 
        style={popUpMenuStyle}
        >
            
        <button className={styles.popUpMenuButton} 
                style={leftestPopUpMenuItemStyle}
                onclick={handleBold}
                >
                    <b>B</b>
        </button>
        <button className={styles.popUpMenuButton}><i>i</i></button>
        <button className={styles.popUpMenuButton} style={rightestPopUpMenuItemStyle}><u>U</u></button>
      </div>

      <div className={styles.preview} dangerouslySetInnerHTML={{ __html: textContent }}></div>  
    </div>
  );
};

export default Note;