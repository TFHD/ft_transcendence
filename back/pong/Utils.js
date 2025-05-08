export function parseJSON(message)
{
	try
	{
		return (JSON.parse(message));
	}
	catch (ex)
	{
		return (null);
	}
}

export const mssleep = ms => new Promise(r => setTimeout(r, ms));
//Sleep function like in c (use it like: "await mssleep(time)")

export function Vector3(x = 0, y = 0, z = 0) {
    return { x, y, z };
}

export function addInPlace(v1, v2) {
    v1.x += v2.x;
    v1.y += v2.y;
    v1.z += v2.z;
}

export function length(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

export function copyFrom(target, source) {
    target.x = source.x;
    target.y = source.y;
    target.z = source.z;
}