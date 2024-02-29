import firebaseConfig from "./firebaseConfig";
import {initializeApp} from 'firebase/app';
import {getFirestore, collection, serverTimestamp, addDoc, onSnapshot, query, orderBy} from 'firebase/firestore'

/* INITIALIZE FIREBASE */
initializeApp(firebaseConfig);

/* INITIALIZE FORESTORE DATABASE */
export const database = getFirestore();

/* CONNECT TO THE TODOS COLLECTION ON FIRESTORE */
const todosCollection = collection(database, 'todos');


import {validateForm, validateDescription} from './formValidation'
import {renderTodos} from './renderTodos'

let todosArray = [];

/* SELECTING THE DOM ELEMENTS */
const taskTitleInput = document.querySelector('.task-title-input');
const taskDateInput = document.querySelector('.task-date-input');
const taskDescriptionInput = document.querySelector('.task-description-input');
const submitTaskButton = document.querySelector('.submit-task-button');
const titleError = document.querySelector('.title-error');
const dateError = document.querySelector('.date-error');
const descriptionError = document.querySelector('.description-error');
const charCount = document.querySelector('.char-count');
const successMessage = document.querySelector('.success-message');
const taskForm = document.querySelector('.todo-form');
const filterElement = document.querySelector('.filter-element');

/* VALIDATE THE DESCRIPTION */
validateDescription(taskDescriptionInput, charCount, descriptionError);

/* HANDLE FILTER ACTION */
filterElement.addEventListener('change', ()=>{
	const selectedMonth = Number(filterElement.value);

	if(selectedMonth === 0 ){
		renderTodos(todosArray)
	} else {
		const filteredTodos = todosArray.filter(todo =>{
			const {todoDate} = todo;
			const dueDate = new Date(todoDate);
			const month = dueDate.getMonth() + 1;
			return selectedMonth === month
		})
		renderTodos(filteredTodos)
	}
})

/* HANDLE SUBMIT ACTION */
submitTaskButton.addEventListener('click', (e)=>{
	e.preventDefault();
	const {formErrorStatus} = validateForm(taskTitleInput.value, taskDateInput.value, titleError, dateError);

	if(formErrorStatus()){
		return
	} else{
		const newTodo = {
			todoTitle: taskTitleInput.value,
			todoDate: taskDateInput.value,
			todoDescription: taskDescriptionInput.value,
			timeStamp: serverTimestamp()
		}
		addDoc(todosCollection, newTodo)
		.then(()=>{
			taskForm.reset();
			successMessage.style.visibility = 'visible';
			successMessage.textContent = 'The task was submitted successfully!'
			setTimeout(() =>{
				successMessage.style.visibility = 'hidden';
			}, 2000)
			.catch(() =>{
				successMessage.textContent = 'Submission failed!'
			})
		});
	}
});

/* FETCH TODOS DATA FROM DATABASE */
function fetchTodos(){
	const sortedTodos = query(todosCollection, orderBy('timeStamp', 'asc'))
	onSnapshot(sortedTodos, (snapshot)=>{
		todosArray = [];
		snapshot.docs.forEach((todo)=>{
			todosArray.push({id: todo.id, ...todo.data() });
		});
		renderTodos(todosArray)
	});
}

window.addEventListener('DOMContentLoaded', ()=>{
	fetchTodos();
});