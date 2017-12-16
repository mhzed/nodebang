import * as React from "react";
export interface AppProps { title: string; }
export class App extends React.Component<AppProps, {}> {
    render() {
        return <h1>App {this.props.title}!</h1>;
    }
}
