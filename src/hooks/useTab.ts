import { useSearchParams } from 'next/navigation';

export function useTab() {
	const searchParams = useSearchParams();
	const tab = searchParams.get('tab')?.replace(/-/g, ' ');

	return tab;
}
