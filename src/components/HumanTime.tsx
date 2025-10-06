import { useEffect, useState } from "react";
import { format } from "timeago.js";

export function HumanTime({ time }: { time: Date | undefined }) {
	const [renderTime, setRenderTime] = useState(false);

	useEffect(() => {
		setRenderTime(true);
	}, [setRenderTime]);

	if (!time) {
		return null;
	}
	return (
		<span
			title={
				renderTime
					? time.toLocaleString("en-gb", {
							dateStyle: "full",
							timeStyle: "full",
							hour12: true,
						})
					: ""
			}
		>
			{format(time, "en_GB")}
		</span>
	);
}
