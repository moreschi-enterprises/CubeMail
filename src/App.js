import React, { Component } from "react";
import Aside from "./Components/Aside";
import MessageList from "./Components/MessageList";
import Message from "./Components/Message";
import { Api } from "./Components/Api";
import { ThemeProvider, CSSReset, Button, Flex } from "@chakra-ui/core";

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      message: {},
      labels: [],
    };
  }

  componentDidMount() {
    window.gapi.load("client:auth2", {
      callback: () => {
        // Handle gapi.client initialization.
        window.gapi.client.setApiKey(Api.apiKey);
        window.gapi.auth.authorize(
          {
            client_id: Api.clientId,
            scope: Api.scopes,
            immediate: true,
          },
          this.handleAuthResult
        );
      },
      onerror: function () {
        // Handle loading error.
        alert("gapi.client failed to load!");
      },
      timeout: 5000, // 5 seconds.
      ontimeout: function () {
        // Handle timeout.
        alert("gapi.client could not load in a timely manner!");
      },
    });
  }

  handleAuthResult = (authResult) => {
    if (authResult && !authResult.error) {
      console.log("Sign-in successful");
      console.log(authResult);
      this.hideAuthBtn();
      this.loadClient();
    } else {
      console.error("handleAuthResult...");
      console.error(authResult);
      this.displayAuthBtn();
    }
  };

  hideAuthBtn = () => {
    document.getElementById("authBtn").style.display = "none";
  };

  displayAuthBtn = () => {
    document.getElementById("authBtn").style.display = "block";
  };

  handleAuthClick = () => {
    return window.gapi.auth.authorize(
      {
        client_id: Api.clientId,
        scope: Api.scopes,
        immediate: false,
      },
      this.handleAuthResult
    );
  };

  loadClient = () => {
    return window.gapi.client.load("gmail", "v1").then(
      (res) => {
        console.log("window.gapi client loaded for API");
        // this.getLabels();
        this.getMessages();
      },
      (err) => {
        console.error("Error loading window.gapi client for API", err);
      }
    );
  };
  // ----------- REQUEST ------------
  getMessages = (labelIds = "INBOX") => {
    return window.gapi.client.gmail.users.messages
      .list({
        userId: "me",
        labelIds: labelIds,
        maxResults: 20,
      })
      .then(
        (response) => {
          // Handle the results here (response.result has the parsed body).
          console.log("getMessages...");
          console.log(response.result);

          const messages = response.result.messages
            ? response.result.messages
            : [];
          this.setState({
            messages: messages,
          });
          this.getOneMessage();
        },
        (err) => {
          console.error("getMessages error", err);
        }
      );
  };

  getOneMessage = () => {
    console.log("getOneMessage...");
    const messageId = this.state.messages[5].id;
    console.log("Message ID : ", messageId);

    return window.gapi.client.gmail.users.messages
      .get({
        userId: "me",
        id: messageId,
      })
      .then(
        (response) => {
          // var messages = response.result.messages;
          this.setState({
            message: response.result,
          });
          // this.getMessageBody(response.result.payload);
        },
        (err) => {
          console.error("getMessage error", err);
        }
      );
  };

  getLabels = () => {
    console.log("getLabels...");
    return window.gapi.client.gmail.users.labels
      .list({
        userId: "me",
      })
      .then(
        (response) => {
          // Handle the results here (response.result has the parsed body).
          var labels = response.result.labels;
          this.setState({
            labels: response.result.labels,
          });
        },
        (err) => {
          console.error("getLabels error", err);
        }
      );
  };

  render() {
    console.log(this.state);
    const { message } = this.state;

    return (
      <React.Fragment>
        <ThemeProvider>
          <CSSReset />

          <Button
            id='authBtn'
            display='none'
            variantColor='teal'
            variant='outline'
            onClick={this.handleAuthClick}
          >
            Authorize
          </Button>

          <Flex
            h='100vh'
            minH='600px'
            justify='space-arround'
            wrap='no-wrap'
            p='2em 1em'
            bg='#e5f4f1'
            color='white'
          >
            <Aside />
            <MessageList />
            <Message message={message} frameState={false} />
          </Flex>

          {/* <Main message={this.state.message} /> */}
        </ThemeProvider>
      </React.Fragment>
    );
  }
}

export default App;
