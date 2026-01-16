
import { createClient } from './src/lib/supabase/client'

async function checkProfiles() {
    const supabase = createClient()
    const { data, count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })

    if (error) {
        console.error('Error:', error)
    } else {
        console.log('Count:', count)
        console.log('Profiles:', data)
    }
}

checkProfiles()
