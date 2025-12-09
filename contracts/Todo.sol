// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Todo {
    struct Task {
        uint id;
        string text;
        bool completed;
    }

    uint public taskCount = 0;
    mapping(uint => Task) public tasks;

    event TaskCreated(uint id, string text);
    event TaskCompleted(uint id, bool completed);
    event TaskDeleted(uint id);

    // Add new task
    function createTask(string memory _text) public {
        taskCount++;
        tasks[taskCount] = Task(taskCount, _text, false);
        emit TaskCreated(taskCount, _text);
    }

    // Toggle complete
    function completeTask(uint _id) public {
        Task storage task = tasks[_id];
        task.completed = !task.completed;
        emit TaskCompleted(_id, task.completed);
    }

    // Delete task
    function deleteTask(uint _id) public {
        delete tasks[_id];
        emit TaskDeleted(_id);
    }
}
