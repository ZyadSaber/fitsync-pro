const getInitials = (name: string) =>
    name.split(" ").slice(0, 2).map((w) => w[0]).join("");

export default getInitials;