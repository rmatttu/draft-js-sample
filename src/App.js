import React from 'react'
import { Editor, EditorState, RichUtils, CompositeDecorator, convertToRaw, getDefaultKeyBinding } from 'draft-js';
import logo from './logo.svg';
import './App.css';
import './component.css'

export default class App extends React.Component {
  constructor(props) {
    super(props)

    const compositeDecorator = new CompositeDecorator([
      {
        strategy: handleStrategy,
        component: HandleSpan,
      },
      {
        strategy: hashtagStrategy,
        component: HashtagSpan,
      },
      {
        strategy: numberStrategy,
        component: NumberSpan,
      },
    ]);
    this.state = {
      editorState: EditorState.createEmpty(compositeDecorator),
    }
    this.answers = []
  }

  onChange(editorState) {
    this.setState({ editorState })
  }

  onCalculate() {
    const content = this.state.editorState.getCurrentContent()
    const blocks = content.getBlocksAsArray()
    this.answers = blocks.map(i => this._tryCalculate(i.getText()))
  }

  _tryCalculate(formula) {
    const ans = this.answers
    function getAnswer(n) {
      if(n < 0 || ans.length < n) {
        return NaN
      }
      return ans[n]
    }

    let f = null
    try {
      f = Function("ans", '"use strict"; return (' + formula + ')')
    } catch (e) {
      return NaN
    }
    return f(getAnswer)
  }

  handleKeyCommand(command) {
    const newState = RichUtils.handleKeyCommand(this.state.editorState, command)
    if (newState) {
      this.onChange(newState)
      RichUtils.toggleBlockType(this.state.editorState, 'header-two')
      return true
    }
    return false
  }

  myKeyBindingFn = (e) => {
    if (e.key === "Enter") {
      this.onCalculate()
    }
    return getDefaultKeyBinding(e)
  }

  render() {
    return <div>
      <h1>Draft.js example</h1>
      <div>
        <img src={logo} className="App-logo" alt="logo" />
      </div>
      <div>
        <Editor
          editorState={this.state.editorState}
          onChange={this.onChange.bind(this)}
          handleKeyCommand={this.handleKeyCommand.bind(this)}
          keyBindingFn={this.myKeyBindingFn}
        />
      </div>
      <div>
        {this.answers.map((value, index) => `ans[${index}]: ${value}`).join(" | ")}
      </div>
      <br />
      <div>
        {JSON.stringify(convertToRaw(this.state.editorState.getCurrentContent()))}
      </div>
    </div>
  }


}

/**
 * Super simple decorators for handles and hashtags, for demonstration
 * purposes only. Don't reuse these regexes.
 */
const HANDLE_REGEX = /@[\w]+/g;
const HASHTAG_REGEX = /#[\w\u0590-\u05ff]+/g;
const NUMBER_REGEX = /\d/g;

const HandleStyle = {
  backgroundColor: "#FFCACA"
};

const HashtagStyle = {
  backgroundColor: "#FFE564"
};

const NumberStyle = {
  backgroundColor: "#A9FFB9"
};

function handleStrategy(contentBlock, callback, contentState) {
  findWithRegex(HANDLE_REGEX, contentBlock, callback);
}

function hashtagStrategy(contentBlock, callback, contentState) {
  findWithRegex(HASHTAG_REGEX, contentBlock, callback);
}

function numberStrategy(contentBlock, callback, contentState) {
  findWithRegex(NUMBER_REGEX, contentBlock, callback);
}

function findWithRegex(regex, contentBlock, callback) {
  const text = contentBlock.getText();
  let matchArr, start;
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
}

const HandleSpan = (props) => {
  console.log("メンション")
  return (
    <span
      style={HandleStyle}
      data-offset-key={props.offsetKey}
    >
      {props.children}
    </span>
  );
};

const HashtagSpan = (props) => {
  console.log("ハッシュダグ")
  return (
    <span
      style={HashtagStyle}
      data-offset-key={props.offsetKey}
    >
      {props.children}
    </span>
  );

};

const NumberSpan = (props) => {
  return (
    <span
      style={NumberStyle}
      data-offset-key={props.offsetKey}
    >
      {props.children}
    </span>
  );
}
