import React, { Component } from "react";
import "./Timeline.css";
import TwitterLogo from "../twitter.svg";
import api from "../services/api";
import Tweet from "../components/Tweet";
import socket from "socket.io-client";

export default class Timeline extends Component {
  state = {
    newTweet: "",
    tweets: []
  };

  async componentDidMount() {
    this.subscribeToEvents();
    const response = await api.get("tweets");

    this.setState({ tweets: response.data });
  }

  subscribeToEvents = () => {
    const io = socket("http://localhost:3000/");
    io.on("tweet", data => {
      this.setState({ tweets: [data, ...this.state.tweets] });
    });
    io.on("like", data => {
      this.setState({
        tweets: this.state.tweets.map(tweet => {
          return tweet._id === data._id ? data : tweet;
        })
      });
    });
  };

  handleInputChange = event => {
    this.setState({
      newTweet: event.target.value
    });
  };

  handleNewTweet = async event => {
    if (event.keyCode !== 13) return;

    const content = this.state.newTweet;
    const author = localStorage.getItem("@UTFwitter:username");

    await api.post("/tweets", { content, author });

    this.setState({ newTweet: "" });
  };

  render() {
    return (
      <div className="timeline-wrapper">
        <img height={24} src={TwitterLogo} alt="Logo do Twitter" />

        <form>
          <textarea
            value={this.state.newTweet}
            onChange={this.handleInputChange}
            onKeyDown={this.handleNewTweet}
            placeholder="O que está acontecendo?"
          ></textarea>
        </form>

        <ul className="tweet-list">
          {this.state.tweets.map(tweet => (
            <Tweet tweet={tweet} key={tweet._id} />
          ))}
        </ul>
      </div>
    );
  }
}
