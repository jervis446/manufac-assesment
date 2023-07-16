/**
 * Represents the implementation of the employee organization app.
 */
var EmployeeOrgApp = /** @class */ (function () {
    function EmployeeOrgApp(ceo) {
        this.ceo = ceo;
        this.history = [];
        this.undoneActions = [];
        this.employeeMap = new Map();
        this.buildEmployeeMap(ceo);
    }
    EmployeeOrgApp.prototype.buildEmployeeMap = function (employee) {
        this.employeeMap.set(employee.uniqueId, employee);
        for (var _i = 0, _a = employee.subordinates; _i < _a.length; _i++) {
            var subordinate = _a[_i];
            this.buildEmployeeMap(subordinate);
        }
    };
    EmployeeOrgApp.prototype.findEmployee = function (employeeID) {
        return this.employeeMap.get(employeeID);
    };
    EmployeeOrgApp.prototype.removeFromSubordinates = function (employee, supervisor) {
        var index = supervisor.subordinates.findIndex(function (subordinate) { return subordinate.uniqueId === employee.uniqueId; });
        if (index !== -1) {
            supervisor.subordinates.splice(index, 1);
        }
    };
    EmployeeOrgApp.prototype.addToSubordinates = function (employee, supervisor) {
        supervisor.subordinates.push(employee);
    };
    EmployeeOrgApp.prototype.move = function (employeeID, supervisorID) {
        var employee = this.findEmployee(employeeID);
        var supervisor = this.findEmployee(supervisorID);
        if (employee && supervisor) {
            var previousSupervisor = this.employeeMap.get(employee.uniqueId);
            if (previousSupervisor) {
                this.removeFromSubordinates(employee, previousSupervisor);
            }
            this.addToSubordinates(employee, supervisor);
            this.history.push({ action: 'move', employeeID: employeeID, supervisorID: supervisorID });
            // Clear undone actions when a new action is performed
            this.undoneActions.length = 0;
        }
    };
    EmployeeOrgApp.prototype.undo = function () {
        var lastAction = this.history.pop();
        if (lastAction && lastAction.action === 'move') {
            var employeeID = lastAction.employeeID, supervisorID = lastAction.supervisorID;
            var employee = this.findEmployee(employeeID);
            var supervisor = this.findEmployee(supervisorID);
            if (employee && supervisor) {
                this.removeFromSubordinates(employee, supervisor);
                var previousSupervisor = this.employeeMap.get(employeeID);
                if (previousSupervisor) {
                    this.addToSubordinates(employee, previousSupervisor);
                }
                // redo action
                this.undoneActions.push(lastAction);
            }
        }
    };
    EmployeeOrgApp.prototype.redo = function () {
        var lastUndoneAction = this.undoneActions.pop();
        if (lastUndoneAction && lastUndoneAction.action === 'move') {
            var employeeID = lastUndoneAction.employeeID, supervisorID = lastUndoneAction.supervisorID;
            var employee = this.findEmployee(employeeID);
            var supervisor = this.findEmployee(supervisorID);
            if (employee && supervisor) {
                var previousSupervisor = this.employeeMap.get(employee.uniqueId);
                if (previousSupervisor) {
                    this.removeFromSubordinates(employee, previousSupervisor);
                }
                this.addToSubordinates(employee, supervisor);
                this.history.push(lastUndoneAction);
            }
        }
    };
    return EmployeeOrgApp;
}());
// Example
var ceo = {
    uniqueId: 1,
    name: 'John Smith',
    subordinates: [
        {
            uniqueId: 2,
            name: 'Margot Donald',
            subordinates: [
                { uniqueId: 6, name: 'Cassandra Reynolds', subordinates: [
                        { uniqueId: 7, name: 'Mary Blue', subordinates: [] },
                        { uniqueId: 8, name: 'Bob Saget', subordinates: [
                                { uniqueId: 9, name: 'Bob Saget', subordinates: [
                                        { uniqueId: 10, name: 'Will Turner', subordinates: [] },
                                    ] }
                            ] },
                    ] },
            ],
        },
        {
            uniqueId: 3,
            name: 'Tyler Simpson',
            subordinates: [
                { uniqueId: 11, name: 'Ben Willis', subordinates: [] },
            ],
        },
        { uniqueId: 4, name: 'Ben Willis', subordinates: [] },
        { uniqueId: 5, name: 'Georgina Flangy', subordinates: [
                { uniqueId: 12, name: 'Sophie Turner', subordinates: [] },
            ] },
    ],
};
var app = new EmployeeOrgApp(ceo);
console.log(app.ceo);
// Move Bob Saget to become subordinate of John Smith
app.move(8, 1);
console.log(app.ceo);
// Undo the move action
app.undo();
console.log(app.ceo);
// Redo the undone action
app.redo();
console.log(app.ceo);
