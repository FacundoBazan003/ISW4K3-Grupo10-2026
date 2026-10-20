export interface User {
    id: number;
    name: string;
    email: string;
}

export const userMock: User[] = [
    {
        id: 1,
        name: "Federico Nieto",
        email: "federiconieto04@gmail.com",
    },
    {
        id: 2,
        name: "Juan Perez",
        email: "juanperez@email.com",
    },
];
