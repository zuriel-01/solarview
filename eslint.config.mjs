import nextConfig from "eslint-config-next/core-web-vitals";

const eslintConfig = [
	...nextConfig,
	{
		rules: {
			"react-hooks/set-state-in-effect": "off",
			"react-hooks/immutability": "off",
		},
	},
];

export default eslintConfig;
