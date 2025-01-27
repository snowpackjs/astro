import { navigate } from "astro:transitions/client";
import React from 'react';
export default function ClickToNavigate({ to, id }) {
    return <button id={id} onClick={() => navigate(to)}>Navigate to `{to}`</button>;
}
