export interface Props {
    msg: string;
}

export default function CustomRendererTest({ msg }: Props) {
    return {
        tag: "p",
        text: msg
    }
}