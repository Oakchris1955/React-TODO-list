import { StatusBar } from 'expo-status-bar';
import React, { useEffect ,Component } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DeserialisedList {
	TODO_list: {
		text: string,
		isDone: boolean
	}[]
}

class App extends Component {
	//list: {text: string, isDone: boolean}[] = [];
	state: {
		//list: {text: string, isDone: boolean}[],
		TODO_list: TODO_Entry[]
	} = {
		//list: [],
		TODO_list: []
	};

	inputText?: string;
	maxKey: number = 0;

	
	constructor(props: any) {
		super(props);
		this._readStorage()
		.then((todo_list) => {
			console.log(todo_list);
			this.setState({TODO_list: todo_list.map(
				(item) => {
					return new TODO_Entry({
						text: item.text,
						parent: this,
						isDone: item.isDone
					})
				})
			});
		})
		.catch();
	}


	
	async _readStorage() {
		try {
			const value = await AsyncStorage.getItem("TODO_list");
			if (value !== null) {
				let DeserialisedValue: DeserialisedList = JSON.parse(value);
				console.log(`Loaded ${DeserialisedValue}`);
				console.log(DeserialisedValue);
				return DeserialisedValue.TODO_list;
			} else {
				return [] as DeserialisedList["TODO_list"]
			}
		} catch(err) {
			throw err
		}
	}

	componentDidUpdate() {
		this._saveStorage().catch();
	}

	async _saveStorage() {
		try {
			let props_list = this.state.TODO_list.map(
				(item) => item.getInfo()
			);
			let SerialisedList = JSON.stringify({TODO_list: props_list});
			console.log(`Saved ${SerialisedList}`);
			await AsyncStorage.setItem("TODO_list", SerialisedList);
		} catch(err) {
			throw err
		}
	}

	_add_to_list() {
		if (typeof this.inputText !== "undefined") {
			/*this.setState({list: this.state.list.concat(
				{
					text: this.inputText,
					isDone: false
				}
			)});*/
			this.maxKey += 1;
			this.setState({TODO_list: this.state.TODO_list.concat(
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
		let editedList = this.state.TODO_list.filter((item) => !(item.toBeRemoved));
		if (!this.state.TODO_list.every((val, index) => val === editedList[index])) {
			this.setState({
				TODO_list: editedList
			});
		}
	}
	render() {
		/*const finalList = this.state.list.map((item, index) => 
			<TODO_Entry text={item.text} isDone={item.isDone} key={index}/>
		);*/
		//console.log(finalList);
		//this._check_to_remove();
		const finalList: JSX.Element[] = this.state.TODO_list.map(
			(entry) => entry.render()
		);
		console.log("Re-rendered App");
		return (
			<View style={styles.container}>
				<View style={{justifyContent: "center", alignItems: "center", width:"100%"}}>
					{finalList}
				</View>
				<TextInput onChangeText={(text) => {this.inputText = text;}} onSubmitEditing={() => {this._add_to_list()}} placeholder="TODO: " style={[styles.input, {marginVertical: 7.5}]}/>
				<Pressable onPress={() => {this._add_to_list()}} style={styles.pressable}><Text style={{textAlign: 'center'}}>Add to TODO list</Text></Pressable>
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
		this.done = typeof props.isDone === "undefined" ? true : false;
		this.text = props.text;
		this.parent = props.parent;
		this.key = this.parent.maxKey;
	}

	getInfo(): DeserialisedList["TODO_list"][0] {
		return {
			text: this.text,
			isDone: this.done
		};
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