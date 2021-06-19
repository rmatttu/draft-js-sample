import React from 'react'
import {Editor, EditorState, RichUtils, CompositeDecorator} from 'draft-js';
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
		]);
    this.state = {
      editorState: EditorState.createEmpty(compositeDecorator),
    }
  }

  onChange(editorState) {
    this.setState({editorState})
  }
	handleKeyCommand(command) {
    console.log(command)
		const newState = RichUtils.handleKeyCommand(this.state.editorState, command)
			if (newState) {
				this.onChange(newState)
        RichUtils.toggleBlockType(this.state.editorState, 'header-two')
					return true
			}
		return false
	}

  render() {
    return <div>
    <h1>Draft.js example</h1>
    <img src={logo} className="App-logo" alt="logo" />
      <Editor
        editorState={this.state.editorState}
        onChange={this.onChange.bind(this)}
        handleKeyCommand={this.handleKeyCommand.bind(this)}
      />
    </div>
  }


}

/**
 * Super simple decorators for handles and hashtags, for demonstration
 * purposes only. Don't reuse these regexes.
 */
const HANDLE_REGEX = /@[\w]+/g;
const HASHTAG_REGEX = /#[\w\u0590-\u05ff]+/g;

const HandleStyle = {
	backgroundColor:"#FFCACA"
};

const HashtagStyle = {
	backgroundColor:"#FFE564"
};

function handleStrategy(contentBlock, callback, contentState) {
	findWithRegex(HANDLE_REGEX, contentBlock, callback);
}

function hashtagStrategy(contentBlock, callback, contentState) {
	findWithRegex(HASHTAG_REGEX, contentBlock, callback);
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
