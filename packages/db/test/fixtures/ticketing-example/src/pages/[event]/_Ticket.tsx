import { createForm } from 'simple:form';
import { useState } from 'react';
import { z } from 'zod';
import { Form, Input } from '../../components/Form';

export const ticketForm = createForm({
	email: z.string().email(),
	quantity: z.number().max(10),
	newsletter: z.boolean(),
});

export function TicketForm({ price }: { price: number }) {
	const [quantity, setQuantity] = useState(1);
	return (
		<>
			<Form validator={ticketForm.validator}>
				<h3>${(quantity * price) / 100}</h3>

				<label htmlFor="quantity">Quantity</label>
				<Input
					id="quantity"
					{...ticketForm.inputProps.quantity}
					onInput={(e) => {
						const value = Number(e.currentTarget.value);
						setQuantity(value);
					}}
				/>

				<label htmlFor="email">Email</label>
				<Input id="email" {...ticketForm.inputProps.email} />

				<div className="newsletter">
					<Input id="newsletter" {...ticketForm.inputProps.newsletter} />
					<label htmlFor="newsletter">Hear about the next event in your area</label>
				</div>
				<button>Buy tickets</button>
			</Form>
		</>
	);
}
