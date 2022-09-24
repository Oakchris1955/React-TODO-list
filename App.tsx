import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import BouncyCheckbox from "react-native-bouncy-checkbox";

class App extends Component {
	//list: {text: string, isDone: boolean}[] = [];
	state: {
		//list: {text: string, isDone: boolean}[],
		list: TODO_Entry[]
	} = {
		//list: [],
		list: []
	};
	inputText?: string;

	maxKey: number = 0;

	_add_to_list() {
		if (typeof this.inputText !== "undefined") {
			/*this.setState({list: this.state.list.concat(
				{
					text: this.inputText,
					isDone: false
				}
			)});*/
			this.maxKey += 1;
			this.setState({list: this.state.list.concat(
				new TODO_Entry({
					text: this.inputText,
					parent: this
				})
			)});
			//console.log((<TODO_Entry text={this.inputText} isDone={false} key={this.maxKey} removeElement={() => {removeElement(this, nextListIndex)}}/>));
		}
	}
	check_to_remove() {
		/*let newList = this.state.list.filter((item, index) => {
			item.key
		});*/
		let editedList = this.state.list.filter((item) => !(item.toBeRemoved));
		if (!this.state.list.every((val, index) => val === editedList[index])) {
			this.setState({
				list: editedList
			});
		}
	}
	render() {
		/*const finalList = this.state.list.map((item, index) => 
			<TODO_Entry text={item.text} isDone={item.isDone} key={index}/>
		);*/
		//console.log(finalList);
		//this._check_to_remove();
		const finalList: JSX.Element[] = this.state.list.map(
			(entry) => entry.render()
		);
		console.log("Re-rendered App");
		return (
			<View style={styles.container}>
				<View style={{justifyContent: "center", alignItems: "center", width:"100%"}}>
					{finalList}
				</View>
				<TextInput onChangeText={(text) => {this.inputText = text;}} placeholder="TODO: " style={[styles.input, {marginVertical: 7.5}]}/>
				<Pressable onPress={() => {this._add_to_list()}} style={styles.pressable}><Text>Add to TODO list</Text></Pressable>
				<StatusBar style="auto" />
			</View>
		);
	}
}

interface TODO_Entry_Props {
	text: string
	parent: App
	isDone?: boolean
}

class TODO_Entry extends Component<TODO_Entry_Props> {
	done: boolean;
	text: string;
	parent: App;
	key: number

	toBeRemoved: boolean = false;

	styles = StyleSheet.create({
		pressableStyle: {
			marginHorizontal: 5,
			marginVertical: 2,
			padding: 2,
			borderColor: "#aebdd0", /* This color is a modified version of #block_button from WebBlocker */
			borderWidth: 2,
			backgroundColor: "#ced7e3"
		},
		BouncyStyle: {
			backgroundColor: "#aaa",
			paddingHorizontal: 3
		},
		BouncyText: {
			color: "#222"
		}
	});

	constructor(props: TODO_Entry_Props) {
		super(props);
		this.done = typeof this.props.isDone === "undefined" ? true : false;
		this.text = this.props.text;
		this.parent = this.props.parent;
		this.key = this.parent.maxKey;
	}

	render() {
		return (
			<View style={{flexDirection: "row", margin: 2}} key={this.key}>
				<BouncyCheckbox text={this.text} fillColor="black" textStyle={this.styles.BouncyText} style={this.styles.BouncyStyle} onPress={(isChecked) => {this.done = isChecked;}} />
				<Pressable style={this.styles.pressableStyle} onPress={() => {this.toBeRemoved = true;this.parent.check_to_remove()}}>
					<Text>
						Remove
					</Text>
				</Pressable>
			</View>
		);
	}
}


const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#888',
		alignItems: 'center',
		justifyContent: 'center'
	},
	input: {
		width: "50%",
		textAlign: 'center',
		borderWidth: 1,
		padding: 5,
		placeholderTextColor: "#999",
		backgroundColor: "#bbb",
	},
	pressable: {
		width: "30%",
		textAlign: "center",
		backgroundColor: "#ccc",
		padding: 3,
		fontSize: 15
	},
	sameLine: {
		flexDirection: 'row'
	},
	marginedContent: {
		margin: 2.5
	}
});

export default App;