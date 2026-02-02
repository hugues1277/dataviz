export const betterAuthMock = {
    signIn: async () => {
        return {
            error: null,
            data: null,
        };
    },
    signOut: async () => {
        return {
            error: null,
            data: null,
        };
    },
    useSession: () => {
        return {
            data: {
                user: {
                    sessionToken: '1234567890',
                    userId: '0',
                    userEmail: 'auth@email.com',
                }
            },
            error: null,
            isPending: false,
        };
    },
};