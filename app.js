// create a cli app using third party modules


// require the modules
import chalk from 'chalk';
import figlet from 'figlet';
import path, { dirname } from 'path';
import fs from 'fs';
import { createRequire } from 'module';
import yargs from 'yargs';
import { clear } from 'console';
import { promisify } from 'util';

const require = createRequire(import.meta.url);


const usage = `
    Usage:
        $ node app.js <command> [options]
    Commands:
        add <task> - add a new task
        list - list all tasks
        delete <task> - delete a task
        complete <task> - mark a task as complete
        clear - clear the screen
        help - show help
    Options:
        --help - show help
`;

const dbPath = path.join(dirname(require.resolve('./package.json')), 'tasks.json');

const randomId = () => {
    return Math.floor(Math.random() * 1000000);
}

const checkDB = async () => {
    const exists = await promisify(fs.exists)(dbPath);
    if (!exists) {
        await promisify(fs.writeFile)(dbPath, '[]');
    }
};


// create a cli app
const cli = async () => {
    // clear the screen
    clear();

    // print the app name
    console.log(chalk.green(figlet.textSync('Edu Todo App', { horizontalLayout: 'full' })));

    // get the command
    const command = process.argv[2];

    // get the command options
    const options = yargs(process.argv.slice(3)).argv;

    // check the command
    switch (command) {
        case 'add':
            addTask(options);
            break;
        case 'list':
            listTasks();
            break;
        case 'delete':
            deleteTask(options);
            break;
        case 'complete':
            completeTask(options);
            break;
        case 'clear':
            clearScreen();
            break;
        case 'help':
            showHelp();
            break;
        default:
            console.log(chalk.red('Command not found'));
            console.log(usage);
            break;
    }
}


// add a new task
const addTask = async (options) => {

    console.log(options._[0]);
    // get the task name
    const taskName = options._[0];

    // check if the task name is empty
    if (taskName === undefined) {
        console.log(chalk.red('Task name is required'));
        console.log(usage);
        return;
    }

    // get the tasks from the file
    const tasks = await getTasks();

    const newTask = {
        id: randomId(),
        task: taskName,
        completed: false
    }

    // check if the task already exists
    const exists = tasks.filter(task => task.task === taskName).length > 0;
    if (exists) {
        console.log(chalk.red('Task already exists'));
        console.log(usage);
        return;
    }

    // add the task to the file
    tasks.push(newTask);

    // save the tasks to the file
    await saveTasks(tasks);

    // print the task was added
    console.log(chalk.green(`Task ${taskName} added`));
}


// list all tasks
const listTasks = async () => {
    // get the tasks from the file
    const tasks = await getTasks();

    // check if there are no tasks
    if (tasks.length === 0) {
        console.log(chalk.red('No tasks found'));
        return;
    }

    // print the tasks
    console.table(tasks);
}


// delete a task
const deleteTask = async (options) => {
    // get the task name
    const taskName = options._[0];

    // check if the task name is empty
    if (taskName === undefined) {
        console.log(chalk.red('Task name is required'));
        console.log(usage);
        return;
    }

    // get the tasks from the file
    const tasks = await getTasks();

    // check if the task already exists
    const exists = tasks.filter(task => task.task === taskName).length > 0;
    if (!exists) {
        console.log(chalk.red(`Task ${taskName} does not exist`));
        return;
    }
    // remove the task from the file
    const newTasks = tasks.filter(task => task.task !== taskName);

    // save the tasks to the file
    await saveTasks(newTasks);

    // print the task was deleted
    console.log(chalk.green(`Task ${taskName} deleted`));
}


// mark a task as complete
const completeTask = async (options) => {
    // get the task name
    const taskName = options._[0];

    // check if the task name is empty
    if (taskName === undefined) {
        console.log(chalk.red('Task name is required'));
        console.log(usage);
        return;
    }

    // get the tasks from the file
    const tasks = await getTasks();

    // check if the task already exists
    const exists = tasks.filter(task => task.task === taskName).length > 0;
    if (!exists) {
        console.log(chalk.red(`Task ${taskName} does not exist`));
        return;
    }

    // mark completed to true
    tasks.forEach(task => {
        if (task.task === taskName) {
            task.completed = true;
        }
    });

    // save the tasks to the file
    await saveTasks(tasks);

    // print the task was completed
    console.log(chalk.green(`Task ${taskName} completed`));
}


// clear the screen
const clearScreen = () => {
    // clear the screen
    clear();

    // print the app name
    console.log(chalk.green(figlet.textSync('Edu Todo App', { horizontalLayout: 'full' })));
}


// show help
const showHelp = () => {
    // print the help
    console.log(usage);
}


// get the tasks from the file
const getTasks = async () => {
    // get the file path
    await checkDB();

    // get the tasks
    const tasks = await promisify(fs.readFile)(dbPath);

    // parse the tasks
    return JSON.parse(tasks);
}


// save the tasks to the file
const saveTasks = async (tasks) => {
    await checkDB();

    // save the tasks
    await promisify(fs.writeFile)(dbPath, JSON.stringify(tasks));
}


// run the app
cli();