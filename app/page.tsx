import Bands from '@/components/Bands';
import useAuthUser from '@/hooks/useAuthUser';

export default async function IndexPage() {
  const user = await useAuthUser();

  return (
    <>
      <div className="animate-in">
        <h2 className="font-bold text-2xl mb-4">
          Welcome to your one-stop band management shop!
        </h2>
        {user ? (
          <Bands />
        ) : (
          <>
            <p className="my-2">
              Being in a band is <span className="italic">SUPPOSED TO BE</span>{' '}
              fun.
            </p>
            <p className="my-2">
              Keeping track of your setlists, song lists, and all of the other{' '}
              <span className="italic">administrative band things</span> in
              various spreadsheets and documents is not!
            </p>
            <p className="my-2">
              We&apos;re here to keep track of all of that stuff for you. Log in
              and get started!
            </p>
          </>
        )}
      </div>
    </>
  );
}
