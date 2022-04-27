<template>
    <div>
        Enable autoconnect?
        <select
            @change="ethereum.emit('autoconnectChanged', $event)"
            :value="autoconnect"
        >
            <option value="">No</option>
            <option value=".">Yes</option>
        </select>
    </div>
</template>

<script>
    export default {
        props: ["autoconnect"],
        data() {
            return {
                ethereum: ethereum
            }
        }
    }
</script>
