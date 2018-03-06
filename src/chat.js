// import React, {Component} from 'react';
// import axios from 'axios';
// import { connect } from 'react-redux';
//
//
// class Chat extends Component {
//   constructor(props){
//     super(props)
//   }
//
//   onkeyDown(e) {
//       if(e.keyCode == 13) {
//           let msg = e.target.value;
//           e.target.value = ' ';
//           e.preventDefault();
//           emitChatMesssage(msg)
//       }
//   }
//
//   componentDidMount() {
//         this.props.dispatch(chatMessages())
//   }
//
//   render (
//       <textarea onkeyDown = {(e) => {this.onkeyDown(e)}} <textarea>
//   )
