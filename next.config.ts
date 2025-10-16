import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: false,
	},
	webpack: (config, { isServer }) => {
		if (isServer) {
			// 外部化 mysql2，让它在服务端环境中正确加载
			config.externals = config.externals || [];
			config.externals.push({
				'mysql2': 'commonjs mysql2',
				'mysql2/promise': 'commonjs mysql2/promise'
			});
		}
		return config;
	},
};

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
