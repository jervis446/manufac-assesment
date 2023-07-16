/**
 * Represents an employee in the organization.
 */
interface Employee {
    uniqueId: number;
    name: string;
    subordinates: Employee[];
}
/**
 * Represents the employee organization app.
 */
interface IEmployeeOrgApp {
    ceo: Employee;
    move(employeeID: number, supervisorID: number): void;
    undo(): void;
    redo(): void;
}
/**
 * Represents the implementation of the employee organization app.
 */
class EmployeeOrgApp implements IEmployeeOrgApp {
    private readonly history: { action: string; employeeID: number; supervisorID: number }[];
    private readonly undoneActions: { action: string; employeeID: number; supervisorID: number }[];
    private readonly employeeMap: Map<number, Employee>;

    constructor(public ceo: Employee) {
        this.history = [];
        this.undoneActions = [];
        this.employeeMap = new Map<number, Employee>();
        this.buildEmployeeMap(ceo);
    }

    private buildEmployeeMap(employee: Employee) {
        this.employeeMap.set(employee.uniqueId, employee);
        for (const subordinate of employee.subordinates) {
            this.buildEmployeeMap(subordinate);
        }
    }

    private findEmployee(employeeID: number): Employee | undefined {
        return this.employeeMap.get(employeeID);
    }

    private removeFromSubordinates(employee: Employee, supervisor: Employee) {
        const index = supervisor.subordinates.findIndex((subordinate) => subordinate.uniqueId === employee.uniqueId);
        if (index !== -1) {
            supervisor.subordinates.splice(index, 1);
        }
    }

    private addToSubordinates(employee: Employee, supervisor: Employee) {
        supervisor.subordinates.push(employee);
    }

    move(employeeID: number, supervisorID: number): void {
        const employee = this.findEmployee(employeeID);
        const supervisor = this.findEmployee(supervisorID);
        if (employee && supervisor) {
            const previousSupervisor = this.employeeMap.get(employee.uniqueId);
            if (previousSupervisor) {
                this.removeFromSubordinates(employee, previousSupervisor);
            }
            this.addToSubordinates(employee, supervisor);
            this.history.push({ action: 'move', employeeID, supervisorID });
            // Clear undone actions when a new action is performed
            this.undoneActions.length = 0;
        }
    }

    undo(): void {
        const lastAction = this.history.pop();
        if (lastAction && lastAction.action === 'move') {
            const { employeeID, supervisorID } = lastAction;
            const employee = this.findEmployee(employeeID);
            const supervisor = this.findEmployee(supervisorID);
            if (employee && supervisor) {
                this.removeFromSubordinates(employee, supervisor);
                const previousSupervisor = this.employeeMap.get(employeeID);
                if (previousSupervisor) {
                    this.addToSubordinates(employee, previousSupervisor);
                }
                // redo action
                this.undoneActions.push(lastAction);
            }
        }
    }

    redo(): void {
        const lastUndoneAction = this.undoneActions.pop();
        if (lastUndoneAction && lastUndoneAction.action === 'move') {
            const { employeeID, supervisorID } = lastUndoneAction;
            const employee = this.findEmployee(employeeID);
            const supervisor = this.findEmployee(supervisorID);
            if (employee && supervisor) {
                const previousSupervisor = this.employeeMap.get(employee.uniqueId);
                if (previousSupervisor) {
                    this.removeFromSubordinates(employee, previousSupervisor);
                }
                this.addToSubordinates(employee, supervisor);
                this.history.push(lastUndoneAction);
            }
        }
    }
}

// Example
const ceo: Employee = {
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

const app = new EmployeeOrgApp(ceo);

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
