import { Authing, AuthingOptions } from '@authing/miniapp-uniapp';
import { setAuthHeader } from './request';

let authing: Authing | null = null;
let poolName: string | null = null;
let authAppId: string | null = null;

export default {
	async init(options: AuthingOptions & { poolName: string }) {
		poolName = options.poolName;
		authAppId = options.appId;
		authing = new Authing(options);
		const [err, res] = await authing.getLoginState();
		if (res && res.access_token) {
			setAuthHeader(`Bearer ${res.access_token}`);
			return true;
		} else {
			try {
				uni.removeStorageSync(`authing:${authAppId}:uni-login-code`);
			} catch (e) {
				console.error(e);
			}
			authing.logout();
		}
	},
	async login() {
		if (!authing) {
			console.error('请先初始化auth模块');
			return;
		}
		// @ts-ignore
		const { encryptedData, iv } = await uni.getUserProfile({
			desc: 'getUserProfile'
		});
		const [error, res] = await authing.loginByCode({
			// 你的小程序身份源唯一标识
			extIdpConnidentifier: poolName!,
			wechatMiniProgramCodePayload: {
				encryptedData,
				iv
			},
			options: {
				scope: 'openid profile offline_access'
			}
		});
		if (res && res.access_token) {
			setAuthHeader(`Bearer ${res.access_token}`);
			return true;
		}
	},
	async loginByPhone(e) {
		if (!authing) {
			console.error('请先初始化auth模块');
			return;
		}
		const { code } = e.detail;
		const [error, res] = await authing.getPhone({
			// 你的小程序身份源唯一标识
			extIdpConnidentifier: poolName!,
			code
		});
		console.log(error, res);
	}
};
