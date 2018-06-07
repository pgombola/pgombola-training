import { Promise } from 'es6-promise';
import { AuthenticationDetails, CognitoUser, CognitoUserPool, CognitoUserSession } from 'amazon-cognito-identity-js';
import AWS = require('aws-sdk');

export interface UserLogin {
    session?: {
        accessToken: string;
    };
    error?: string;
}

export class Login {

    constructor() {
        this.updateConfig();
    }

    login(user: string, pass: string): Promise<UserLogin> {
        try {
            const authDetails = this.getAuthDetails(user, pass);
            const cogPool = this.getCognitoPool();
            const cogUser = this.getUser(user, cogPool);
            return new Promise((resolve, reject) => {
                cogUser.authenticateUser(authDetails, {
                    onSuccess: this.handleSuccess(resolve),
                    onFailure: this.handleFailure(reject),
                    newPasswordRequired: (userAttr: any, requireAttr: any) => {
                        Object.keys(requireAttr).map(i => requireAttr[i])

                        for (let i = 0; i < requireAttr.length; i++) {

                        }
                        cogUser.completeNewPasswordChallenge(
                            pass,
                            requiredAttr,
                            {
                                onSuccess: this.handleSuccess(resolve),
                                onFailure: this.handleFailure(reject)
                            });
                    },
                });
            });
        } catch(e) {
            const errResult: UserLogin = {
                error: JSON.stringify(e.toString())
            }
            return Promise.reject(errResult);
        }
    }

    private handleSuccess(resolve: (ul: UserLogin) => void): (sess: CognitoUserSession) => void {
        return function(sess: CognitoUserSession) {
            const result: UserLogin = {
                session: {
                    accessToken: sess.getAccessToken().getJwtToken(),
                },
            };
            resolve(result);
        };
    }

    private handleFailure(reject: (ul: UserLogin) => void): (err: any) => void {
        return function(err: any) {
            console.log(`ERROR: ${JSON.stringify(err)}`);
            const errResult: UserLogin = {
                error: JSON.stringify(err),
            }
            reject(errResult);
        }
    }

    private getUser(user: string, pool: CognitoUserPool): CognitoUser {
        const userData = {
            Username: user,
            Pool: pool
        };
        return new CognitoUser(userData);
    }

    private getCognitoPool(): CognitoUserPool {
        const poolData = {
            UserPoolId: `${process.env.poolId}`,
            ClientId: `${process.env.clientId}`
        };
        return new CognitoUserPool(poolData);
    }

    private getAuthDetails(user: string, pass: string): AuthenticationDetails {
        const authData = {
            Username: user,
            Password: pass
        };
        return new AuthenticationDetails(authData);
    }

    private updateConfig(): void {
        AWS.config.update({
            region: `${process.env.region}`,
            accessKeyId: `${process.env.awskey}`,
            secretAccessKey: `${process.env.awssecret}`
        });
    }
}