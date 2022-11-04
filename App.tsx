import { StatusBar } from 'expo-status-bar';
import React, { useEffect, Component } from 'react';
import { Button, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import ModalDropdown from 'react-native-modal-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


interface DeserialisedStorage {
	SavedLists: {
		[index: string]: {
			text: string,
			isDone: boolean
		}[]
	},
	LastOpened: string
}

enum ModalState {
	Hidden,
	Insert,
	Remove
}

class App extends Component {
	state: {
		CurrentList: Entry[],
		modalState: ModalState
	} = {
		CurrentList: [],
		modalState: ModalState.Hidden
	};

	inputText?: string;
	maxKey: number = 0;

	savedStorage: DeserialisedStorage = {
		SavedLists: {},
		LastOpened: "TODO"
	};

	appendModalInputText: string | null = null;


	constructor(props: any) {
		super(props);
		this._readStorage()
		.then((storagevar) => {
			this.savedStorage = storagevar;
			this.setState({
				CurrentList: storagevar.SavedLists[storagevar.LastOpened].map(
					(value) => 	
					new Entry({
						text: value.text,
						parent: this,
						isDone: value.isDone
					})
				)
			});
		})
		.catch();
	}

	async _readStorage() {
		try {
			const value = await AsyncStorage.getItem("ListData");
			if (value !== null) {
				let DeserialisedValue: DeserialisedStorage = JSON.parse(value);
				console.log(`Loaded ${DeserialisedValue}`);
				console.log(DeserialisedValue);
				return DeserialisedValue;
			} else {
				return {
					SavedLists: {
						"TODO": []
					},
					LastOpened: "TODO"
				} as DeserialisedStorage
			}
		} catch(err) {
			throw err
		}
	}

	componentDidUpdate() {
		console.log("A component updated");
		this.syncStorage();
		this.saveStorage().catch();
	}

	syncStorage() {
		this.savedStorage.SavedLists[this.savedStorage.LastOpened]
		= this.state.CurrentList.map(
			(item) => item.getInfo()
		);
		console.log("Synced storage");
	}

	async saveStorage() {
		try {
			let SerialisedList = JSON.stringify(this.savedStorage);
			console.log(`Saved ${SerialisedList}`);
			await AsyncStorage.setItem("ListData", SerialisedList);
		} catch(err) {
			throw err
		}
	}

	newList(name: string) {
		this.savedStorage.SavedLists[name] = [];
		this.saveStorage();
	}

	removeList(name: string) {
		delete this.savedStorage.SavedLists[name];
		console.log(`Removed "${name}"`)
		this.saveStorage();
	}

	changeList(name: string) {
		this.savedStorage.LastOpened = name;
		this.saveStorage();
		this._readStorage()
		.then((storagevar) => {
			this.savedStorage = storagevar;
			this.setState({
				CurrentList: storagevar.SavedLists[storagevar.LastOpened].map(
					(value) => 	
					new Entry({
						text: value.text,
						parent: this,
						isDone: value.isDone
					})
				)
			});
		})
		.catch();
	}

	_add_to_list() {
		if (typeof this.inputText !== "undefined") {
			this.setState({CurrentList: this.state.CurrentList.concat(
				new Entry({
					text: this.inputText,
					parent: this
				})
			)});
		}
	}
	check_to_remove() {
		let editedList = this.state.CurrentList.filter((item) => !(item.toBeRemoved));
		if (!this.state.CurrentList.every((val, index) => val === editedList[index])) {
			this.setState({
				CurrentList: editedList
			});
		}
	}
	render() {
		const finalList: JSX.Element[] = this.state.CurrentList.map(
			(entry) => entry.render()
		);

		const finalListRemovableNames = Object.keys(this.savedStorage.SavedLists).map(
			(key) => {
				return (key !== this.savedStorage.LastOpened ? <CustomDisplay text={key} removable={true} parent={this} key={this.maxKey+=1}/> : null)
			}
		);

		const finalListNames = Object.keys(this.savedStorage.SavedLists).map(
			(key) => {
				return <CustomDisplay text={key} removable={false} parent={this} key={this.maxKey+=1}/>
			}
		);
		console.log("Re-rendered App");
		console.log(`Current modal state: ${ModalState[this.state.modalState]}`);

		return (
			<View style={styles.container}>
				<View style={styles.DropdownContainer}>
					<Pressable style={{marginHorizontal: "5%", minWidth: "5%"}} onPress={() => this.setState({modalState: ModalState.Remove})/*this.state.modalObject.changeStatus(ModalStatus.Add)*/}><Text>-</Text></Pressable>
					<ModalDropdown onSelect={(_, selectedString) => {if (selectedString != this.savedStorage.LastOpened) this.changeList(selectedString)}} textStyle={{minWidth: 40, borderColor: "purple", borderWidth: 2, borderRadius: 20}} dropdownStyle={styles.DropdownStyle} defaultValue={this.savedStorage.LastOpened} options={Object.keys(this.savedStorage.SavedLists)}/>
					<Pressable style={{marginHorizontal: "5%", minWidth: "5%"}} onPress={() => this.setState({modalState: ModalState.Insert})}><Text>+</Text></Pressable>
				</View>
				
				<Modal visible={this.state.modalState == ModalState.Remove} animationType="fade" transparent={true}>
					<View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
						<View style={{backgroundColor: "white", borderRadius: 20, padding: 20, justifyContent: "center", alignItems: "center"}}>
							<Text>
								Please select an element to remove:
							</Text>
							{finalListRemovableNames}
							<Pressable style={{borderColor: "lightblue", backgroundColor: "lightblue", borderWidth: 4, borderRadius: 35, paddingHorizontal: 2}} onPress={() => this.setState({modalState: ModalState.Hidden})}>
								<Text>Close</Text>
							</Pressable>
						</View>
					</View>
				</Modal>

				<Modal visible={this.state.modalState == ModalState.Insert} animationType="fade" transparent={true}>
					<View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
						<View style={{backgroundColor: "white", borderRadius: 20, padding: 20, justifyContent: "center", alignItems: "center"}}>
							<View style={{flexDirection: "row", marginBottom: 5}}>
								<View style={{alignItems: "center"}}>
									<TextInput placeholder='New list name:' onChangeText={(text) => this.appendModalInputText = text === "" ? null : text}/>
									<Pressable style={{borderColor: "lightgreen", backgroundColor: "lightgreen", borderWidth: 4, borderRadius: 35, paddingHorizontal: 2}} onPress={() => {if (this.appendModalInputText != null) this.newList(this.appendModalInputText)}}>
										<Text>Create new list</Text>
									</Pressable>
								</View>
								<View>{finalListNames}</View>
							</View>
							<Pressable style={{borderColor: "lightblue", backgroundColor: "lightblue", borderWidth: 4, borderRadius: 35, paddingHorizontal: 2}} onPress={() => this.setState({modalState: ModalState.Hidden})}>
								<Text>Close</Text>
							</Pressable>
						</View>
					</View>
				</Modal>
				
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

interface CustomDisplayProps {
	text: string,
	removable: boolean,
	parent: App
}

class CustomDisplay extends Component<CustomDisplayProps> {
	parent: App;
	text: string;
	removable: boolean;

	constructor(props: CustomDisplayProps) {
		super(props);
		this.parent = this.props.parent;
		this.text = this.props.text;
		this.removable =  this.props.removable;
	}

	styles = StyleSheet.create({
		parentView: {
			flexDirection:'row',
			marginTop: 10
		},
		children: {
			marginHorizontal: "5%",
			borderColor: "lightgrey",
			borderWidth: 2,
			borderRadius: 15,
			minWidth: 50
		}
	});

	render() {
		return (
			<View style={this.styles.parentView}>
				<Text style={this.styles.children}>{this.text}</Text>
				{this.removable ? <Pressable onPress={() => {this.parent.removeList(this.text);}}><Icon name='close' size={20}/></Pressable> : null}
			</View>
		)
	}
}


interface Entry_Props {
	text: string
	parent: App
	isDone?: boolean
}

class Entry extends Component<Entry_Props> {
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

	constructor(props: Entry_Props) {
		super(props);
		this.done = typeof props.isDone === "undefined" ? false : props.isDone;
		this.text = props.text;
		this.parent = props.parent;
		this.key = this.parent.maxKey += 1;
	}

	getInfo(): DeserialisedStorage["SavedLists"][any][any] {
		return {
			text: this.text,
			isDone: this.done
		};
	}

	render() {
		return (
			<View style={{flexDirection: "row", margin: 2}} key={this.key}>
				<BouncyCheckbox text={this.text} fillColor="black" textStyle={this.styles.BouncyText} style={this.styles.BouncyStyle} onPress={(isChecked) => {this.done = isChecked;this.parent.syncStorage();this.parent.saveStorage();}} isChecked={this.done} />
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
	DropdownContainer: {
		top: 0,
		left: 0,
		position: "absolute",
		marginTop: "10%",
		marginLeft: "10%",
		flexDirection: "row"
	},
	DropdownStyle: {
		height: "auto",
		minWidth: "20%"
	},
	marginedContent: {
		margin: 2.5
	}
});

export default App;