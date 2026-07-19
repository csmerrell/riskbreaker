<script setup lang="ts">
import { useSelectedCharacter } from './useSelectedCharacter';

const { selectedMember } = useSelectedCharacter();
</script>

<template>
    <div class="text-standard-md flex flex-col gap-2 px-4 text-white">
        <div class="mb-2">Appearance</div>
        <table>
            <tr>
                <td class="px-2">Hair:</td>
                <td>{{ selectedMember.appearance.hair }}</td>
            </tr>
        </table>
    </div>
</template>
