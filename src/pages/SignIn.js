import React, { Component } from "react";
import { Layout, Button, Row, Col, Typography, Form, Input, Switch, message } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'; // Import icons
import signinbg from "../assets/images/building.jpg";
import { withRouter } from "react-router-dom";

const { Title } = Typography;
const { Header, Content } = Layout;
const API_URL = process.env.REACT_APP_API_URL;

class SignIn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,       // For loading spinner
      rememberMe: false,    // For 'Remember Me' option
      username: '',         // Store username
      password: '',         // Store password
      passwordVisible: false, // Track password visibility
    };
  }
  

  componentDidMount() {
    // On component mount, check localStorage or sessionStorage for saved credentials
    const rememberedUsername = localStorage.getItem("username") || sessionStorage.getItem("username");

    if (rememberedUsername ) {
      this.setState({
        username: rememberedUsername,
        rememberMe: !!localStorage.getItem("username"),  // true if saved in localStorage
      });
    }
  }

  onFinish = async (values) => {
    this.setState({ loading: true }); // Start loading spinner

    try {
      const response = await fetch(`${API_URL}/api/v1/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        message.success("Login successful!");

        // Save credentials based on 'Remember Me'
        if (values.remember) {
          localStorage.setItem("username", values.username);
        } else {
          sessionStorage.setItem("username", values.username);
        }

        localStorage.setItem("token", data.data.token); // Save token
        localStorage.setItem("rl", data.data.rl); // Save role

        this.setState({ loading: false }); // Stop loading spinner
        this.props.history.push("/dashboard"); // Redirect to dashboard
      } else {
       message.error(data.responseDesc  || "Login failed. Please try again.");
        this.setState({ loading: false }); // Stop loading spinner
      }
    } catch (error) {
      console.error("Error during login:", error);
      message.error("An error occurred during login. Please try again.");
      this.setState({ loading: false }); // Stop loading spinner
    }
  };

  onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  handleRememberChange = (checked) => {
    this.setState({ rememberMe: checked });
  };

  togglePasswordVisibility = () => {
    this.setState({ passwordVisible: !this.state.passwordVisible });
  };

  render() {
    const { loading, rememberMe, username, password, passwordVisible } = this.state;

    return (
      <>
        <Layout className="layout-default layout-signin">
          <Header>
            <div className="header-col header-brand">
              <h5>Dashboard Report</h5>
            </div>
          </Header>
          <Content className="signin">
            <Row gutter={[24, 0]} justify="space-around">
              <Col xs={{ span: 24, offset: 0 }} lg={{ span: 6, offset: 2 }} md={{ span: 12 }}>
                <Title className="mb-15">Sign In</Title>
                <Title className="font-regular text-muted" level={5}>
                  Enter your username and password to sign in
                </Title>
                <Form onFinish={this.onFinish} onFinishFailed={this.onFinishFailed} layout="vertical" className="row-col">
                  <Form.Item
                    className="username"
                    label="Username"
                    name="username"
                    initialValue={username} // Pre-fill username if available
                    rules={[
                      { required: true, message: "Please input your username!" },
                    ]}
                  >
                    <Input placeholder="Username" />
                  </Form.Item>

                  <Form.Item
                    className="username"
                    label="Password"
                    name="password"
                    initialValue={password} // Pre-fill password if available
                    rules={[
                      { required: true, message: "Please input your password!" },
                    ]}
                  >
                    <Input.Password
                      type={passwordVisible ? "text" : "password"} // Toggle input type
                      placeholder="Password"
                      iconRender={(visible) =>
                        visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                      } // Ant Design's icon for show/hide
                      onClick={this.togglePasswordVisibility} // Toggle the visibility state
                    />
                  </Form.Item>

                  <Form.Item
                    name="remember"
                    className="align-center"
                    valuePropName="checked"
                    initialValue={rememberMe} // Set the "Remember Me" switch based on state
                  >
                    <Switch checked={rememberMe} onChange={this.handleRememberChange} />
                    Remember me
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      style={{ width: "100%" }}
                      loading={loading} // Show loading spinner
                      disabled={loading} // Disable button when loading
                    >
                      {loading ? "Signing In..." : "SIGN IN"}
                    </Button>
                  </Form.Item>
                </Form>
              </Col>
              <Col className="sign-img" style={{ padding: 12 }} xs={{ span: 24 }} lg={{ span: 12 }} md={{ span: 12 }}>
                <img src={signinbg} alt="" />
              </Col>
            </Row>
          </Content>
        </Layout>
      </>
    );
  }
}

export default withRouter(SignIn);
